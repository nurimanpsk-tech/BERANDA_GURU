import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { getSupabase } from '../../services/supabaseClient';
import { generatePPM } from '../../services/aiService';
import { generatePPMPDF, PPMData } from '../../services/pdfService';
import { ppmService } from '../../services/ppmService';
import { FileText, Sparkles, Download, Loader2, CheckCircle2, AlertCircle, ArrowLeft, Save, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PPMGeneratorProps {
  onBack: () => void;
  onGenerate: (data: PPMData) => void;
  initialData: PPMData | null;
  user: User | null;
}

export default function PPMGenerator({ onBack, onGenerate, initialData, user }: PPMGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [ppmData, setPpmData] = useState<PPMData | null>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [classes, setClasses] = useState<any[]>([]);

  const getAcademicYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-11
    
    if (month < 6) { // Before July
      return `${year - 1}/${year}`;
    } else {
      return `${year}/${year + 1}`;
    }
  };

  const defaultAcademicYear = getAcademicYear();

  // Parsing initial mingguSemester
  const parseMingguSemester = (str: string) => {
    const mingguMatch = str.match(/Minggu ke-(\d+)/);
    const semesterMatch = str.match(/Semester (I|II)/);
    return {
      minggu: mingguMatch ? mingguMatch[1] : '1',
      semester: semesterMatch ? semesterMatch[1] : 'I'
    };
  };

  const initialMS = parseMingguSemester(initialData?.informasiUmum?.mingguSemester || 'Minggu ke-1 / Semester I');

  const [isCustomYear, setIsCustomYear] = useState(false);

  const getCurrentMonthName = () => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[new Date().getMonth()];
  };

  const [schoolInfo, setSchoolInfo] = useState({
    schoolName: initialData?.schoolName || '',
    academicYear: initialData?.academicYear || `TAHUN PELAJARAN ${defaultAcademicYear}`,
    principalName: initialData?.principalName || '',
    teacherName: initialData?.teacherName || '',
    usia: initialData?.informasiUmum?.usia || '4 - 5 Tahun (Kelompok A)',
    minggu: initialMS.minggu,
    semester: initialMS.semester,
    alokasiWaktu: initialData?.informasiUmum?.alokasiWaktu || '',
    hariTanggal: initialData?.informasiUmum?.hariTanggal || '',
  });

  // Fetch School and Class data for auto-fill
  useEffect(() => {
    const fetchSyncData = async () => {
      const supabase = getSupabase();
      if (!supabase || !user) return;

      try {
        // 1. Fetch School Name from Profiles
        const { data: profileData } = await supabase
          .from('profiles')
          .select('school_name')
          .eq('id', user.id)
          .single();

        if (profileData?.school_name && !initialData) {
          setSchoolInfo(prev => ({ ...prev, schoolName: profileData.school_name }));
        }

        // 2. Fetch Class Data
        const { data: classesData } = await supabase
          .from('school_classes')
          .select('*')
          .eq('user_id', user.id);

        if (classesData) {
          setClasses(classesData);
          
          // Auto-fill KS and Guru based on current usia if not initialData
          if (!initialData) {
            const currentGroup = schoolInfo.usia.includes('Kelompok A') ? 'Kelompok A' : 'Kelompok B';
            const classData = classesData.find(c => c.group_name === currentGroup);
            if (classData) {
              setSchoolInfo(prev => ({
                ...prev,
                principalName: classData.principal_name || '',
                teacherName: classData.teacher_name || '',
                // Fallback school name if profile is empty
                schoolName: prev.schoolName || classData.school_name || ''
              }));
            }
          }
        }
      } catch (err) {
        console.error('Error fetching sync data:', err);
      }
    };

    fetchSyncData();
  }, [user]);

  // Update prompt if initialData exists (optional, maybe extract theme)
  useEffect(() => {
    if (initialData) {
      setPrompt(initialData.informasiUmum.tema + (initialData.informasiUmum.subTema ? `, ${initialData.informasiUmum.subTema}` : ''));
    }
  }, [initialData]);

  const handleSaveToSupabase = async (data: PPMData) => {
    if (!user) return;
    setSaveStatus('saving');
    try {
      await ppmService.savePPM(data, user.id);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Error saving to Supabase:', err);
      setSaveStatus('error');
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    const supabase = getSupabase();
    if (!supabase) return;

    setLoading(true);
    setError(null);
    setGenerationStatus('Menghubungkan ke AI...');
    try {
      // Fetch curriculum context from Supabase
      setGenerationStatus('Mengambil referensi kurikulum...');
      let curriculumContext = '';
      if (user) {
        const { data: curriculumData, error: curriculumError } = await supabase
          .from('curriculum_entries')
          .select('elemen, sub_elemen, tp, indikator');
        
        if (!curriculumError && curriculumData && curriculumData.length > 0) {
          curriculumContext = curriculumData.map((e: any) => 
            `[${e.elemen}] ${e.sub_elemen}: ${e.tp} (Indikator: ${e.indikator})`
          ).join('\n');
        }
      }

      const combinedMingguSemester = `Minggu ke-${schoolInfo.minggu} / Semester ${schoolInfo.semester}`;
      setGenerationStatus('Menyusun rencana pembelajaran mendalam...');
      const [tema, subTema] = prompt.split(',').map(s => s.trim());
      const data = await generatePPM(prompt, curriculumContext, schoolInfo.hariTanggal, tema, subTema);
      
      setGenerationStatus('Memfinalisasi data...');
      const fullData = {
        ...data,
        ...schoolInfo,
        id: ppmData?.id, // Preserve ID if editing
        informasiUmum: {
          ...data.informasiUmum,
          usia: schoolInfo.usia,
          mingguSemester: combinedMingguSemester,
          alokasiWaktu: schoolInfo.alokasiWaktu,
          hariTanggal: schoolInfo.hariTanggal,
        }
      };
      setPpmData(fullData);
      onGenerate(fullData); // Update parent state
      
      // Auto-save to Supabase after generation
      setGenerationStatus('Menyimpan ke Cloud...');
      await handleSaveToSupabase(fullData);
      setGenerationStatus('');
    } catch (err: any) {
      console.error(err);
      setError(`Gagal menghasilkan PPM: ${err.message || 'Silakan coba lagi.'}`);
      setGenerationStatus('');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (ppmData) {
      generatePPMPDF(ppmData);
    }
  };

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus draf ini dan mulai dari awal? (Data di Cloud tidak akan terhapus)')) {
      setPrompt('');
      setPpmData(null);
      setError(null);
      setSaveStatus('idle');
      setSchoolInfo(prev => ({
        ...prev,
        alokasiWaktu: '',
        hariTanggal: '',
        minggu: '1',
        semester: 'I'
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-12 text-center relative">
          <button 
            onClick={onBack}
            className="absolute left-0 top-0 p-2 rounded-full hover:bg-stone-200 transition-colors"
            title="Kembali ke Beranda"
          >
            <ArrowLeft size={24} className="text-stone-600" />
          </button>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-4"
          >
            <Sparkles size={14} />
            AI-Powered Education
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-serif font-light mb-4 tracking-tight">
            PPM Generator
          </h1>
          <p className="text-stone-500 max-w-xl mx-auto">
            Buat Perencanaan Pembelajaran Mendalam (PPM) otomatis dengan struktur lengkap dan rapi sesuai standar kurikulum merdeka.
          </p>
        </header>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl shadow-stone-200/50 p-6 md:p-8 mb-8 border border-stone-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Nama Sekolah</label>
              <input
                type="text"
                value={schoolInfo.schoolName}
                onChange={(e) => setSchoolInfo({ ...schoolInfo, schoolName: e.target.value })}
                placeholder="Ketik Nama Sekolah"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Tahun Pelajaran</label>
              <div className="space-y-2">
                <select
                  value={isCustomYear ? 'custom' : schoolInfo.academicYear}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setIsCustomYear(true);
                    } else {
                      setIsCustomYear(false);
                      setSchoolInfo({ ...schoolInfo, academicYear: e.target.value });
                    }
                  }}
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                >
                  <option value={`TAHUN PELAJARAN ${defaultAcademicYear}`}>TAHUN PELAJARAN {defaultAcademicYear}</option>
                  <option value="custom">Ketik Sendiri</option>
                </select>
                {isCustomYear && (
                  <motion.input
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    type="text"
                    placeholder="Contoh: TAHUN PELAJARAN 2024/2025"
                    value={schoolInfo.academicYear}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, academicYear: e.target.value })}
                    className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Usia</label>
              <select
                value={schoolInfo.usia}
                onChange={(e) => {
                  const newUsia = e.target.value;
                  const currentGroup = newUsia.includes('Kelompok A') ? 'Kelompok A' : 'Kelompok B';
                  const classData = classes.find(c => c.group_name === currentGroup);
                  
                  setSchoolInfo({ 
                    ...schoolInfo, 
                    usia: newUsia,
                    principalName: classData?.principal_name || schoolInfo.principalName,
                    teacherName: classData?.teacher_name || schoolInfo.teacherName,
                  });
                }}
                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
              >
                <option value="4 - 5 Tahun (Kelompok A)">4 - 5 Tahun (Kelompok A)</option>
                <option value="5 - 6 Tahun (Kelompok B)">5 - 6 Tahun (Kelompok B)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Minggu / Semester</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={schoolInfo.minggu}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, minggu: e.target.value })}
                  className="bg-white border border-stone-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                >
                  {Array.from({ length: 18 }, (_, i) => i + 1).map((w) => (
                    <option key={w} value={w}>Minggu ke-{w}</option>
                  ))}
                </select>
                <select
                  value={schoolInfo.semester}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, semester: e.target.value })}
                  className="bg-white border border-stone-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                >
                  <option value="I">Semester I</option>
                  <option value="II">Semester II</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Alokasi Waktu</label>
              <input
                type="text"
                value={schoolInfo.alokasiWaktu}
                onChange={(e) => setSchoolInfo({ ...schoolInfo, alokasiWaktu: e.target.value })}
                placeholder="Contoh: 1 - 5 Pertemuan (180 menit/hari)"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Hari, Tanggal</label>
              <input
                type="text"
                value={schoolInfo.hariTanggal}
                onChange={(e) => setSchoolInfo({ ...schoolInfo, hariTanggal: e.target.value })}
                placeholder={`Contoh: Senin - Jumat / ${getCurrentMonthName()} ${new Date().getFullYear()}`}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Tema / Topik Pembelajaran</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Contoh: Aku dan Mimpiku, Alam Semesta, Budaya Lokal..."
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-4 min-h-[120px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none text-lg mb-4"
            />
            <div className="flex justify-end gap-3">
              {(prompt.trim() || ppmData) && (
                <button
                  onClick={handleReset}
                  className="bg-white text-red-600 border border-red-100 px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-red-50 transition-all"
                >
                  <Trash2 size={18} />
                  Hapus Draf
                </button>
              )}
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="bg-[#1A1A1A] text-white px-8 py-3 rounded-xl font-medium flex flex-col items-center justify-center min-w-[160px] hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-black/10"
              >
                <div className="flex items-center gap-2">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  {loading ? 'Menyusun...' : 'Buat PPM'}
                </div>
                {loading && generationStatus && (
                  <span className="text-[10px] font-normal opacity-70 mt-1">{generationStatus}</span>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Kepala Sekolah</label>
              <input
                type="text"
                value={schoolInfo.principalName}
                onChange={(e) => setSchoolInfo({ ...schoolInfo, principalName: e.target.value })}
                placeholder="Ketik Nama Kepala Sekolah"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Guru Kelas</label>
              <input
                type="text"
                value={schoolInfo.teacherName}
                onChange={(e) => setSchoolInfo({ ...schoolInfo, teacherName: e.target.value })}
                placeholder="Ketik Nama Guru"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* Result Section */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-red-50 border border-red-100 text-red-800 p-4 rounded-2xl flex items-center gap-3 mb-8"
            >
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}

          {ppmData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl shadow-stone-200/50 overflow-hidden border border-stone-100"
            >
              <div className="p-6 border-bottom border-stone-100 bg-stone-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900">PPM Berhasil Dibuat</h3>
                    <p className="text-xs text-stone-500 uppercase tracking-widest font-bold">Siap untuk diunduh</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {saveStatus === 'saving' && <Loader2 className="animate-spin text-stone-400" size={16} />}
                  {saveStatus === 'saved' && <CheckCircle2 className="text-emerald-500" size={16} />}
                  {saveStatus === 'error' && <AlertCircle className="text-red-500" size={16} />}
                  <span className="text-xs text-stone-400 font-medium italic">
                    {saveStatus === 'saving' ? 'Menyimpan ke Cloud...' : 
                     saveStatus === 'saved' ? 'Tersimpan di Cloud' : 
                     saveStatus === 'error' ? 'Gagal menyimpan' : ''}
                  </span>
                  <button
                    onClick={() => handleSaveToSupabase(ppmData)}
                    disabled={saveStatus === 'saving'}
                    className="bg-white text-stone-700 border border-stone-200 px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-stone-100 transition-all"
                  >
                    <Save size={18} />
                    Simpan ke Cloud
                  </button>
                  <button
                    onClick={handleDownload}
                    className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                  >
                    <Download size={18} />
                    Unduh PDF (Landscape)
                  </button>
                </div>
              </div>

              <div className="p-8">
                <div className="space-y-8">
                  <section>
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-4 border-b border-stone-100 pb-2">Informasi Umum</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Tema</p>
                        <p className="font-medium">{ppmData.informasiUmum.tema}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Sub Tema</p>
                        <p className="font-medium">{ppmData.informasiUmum.subTema}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Usia</p>
                        <p className="font-medium">{ppmData.informasiUmum.usia}</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-4 border-b border-stone-100 pb-2">Asesmen Awal</h4>
                    <p className="text-stone-600 mb-4 leading-relaxed">{ppmData.asesmenAwal.deskripsi}</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {ppmData.asesmenAwal.poinPoin.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                          <span className="text-emerald-500 mt-1">•</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-4 border-b border-stone-100 pb-2">Tujuan Pembelajaran</h4>
                    <ul className="space-y-2">
                      {ppmData.desainPembelajaran.tujuanPembelajaran.map((t, i) => (
                        <li key={i} className="flex items-start gap-3 bg-stone-50 p-3 rounded-xl text-sm text-stone-700">
                          <span className="w-6 h-6 rounded-full bg-white border border-stone-200 flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-12 text-center text-stone-400 text-xs font-medium uppercase tracking-widest">
          &copy; 2026 PPM AI Generator • Crafted for Teachers
        </footer>
      </div>
    </div>
  );
}
