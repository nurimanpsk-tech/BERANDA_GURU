import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, FileText, Download, Loader2, Calendar, Users, Clock, Save, Plus, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CurriculumEntry, PPMData } from '../../types';
import { getSupabase } from '../../services/supabaseClient';
import { User } from '@supabase/supabase-js';
import { generateJSON } from '../../services/aiService';

interface PPMGeneratorProps {
  onBack: () => void;
  onGenerate?: (data: PPMData) => void;
  initialData?: PPMData | null;
  user: User | null;
}

export default function PPMGenerator({ onBack, onGenerate, initialData, user }: PPMGeneratorProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [curriculum, setCurriculum] = useState<CurriculumEntry[]>([]);
  const [selectedTPs, setSelectedTPs] = useState<CurriculumEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    tema: '',
    subTema: '',
    usia: '5-6 tahun',
    minggu: '1',
    semester: '1',
    alokasiWaktu: '180 menit/hari',
    hariTanggal: 'Senin - Jumat'
  });

  const [generatedPPM, setGeneratedPPM] = useState<PPMData | null>(null);

  const supabase = getSupabase();

  useEffect(() => {
    const loadCurriculum = async () => {
      if (!supabase || !user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('curriculum_entries')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) throw error;
        if (data) {
          setCurriculum(data.map(item => ({
            id: item.id,
            elemen: item.elemen,
            subElemen: item.sub_elemen,
            tp: item.tp,
            atp: item.atp,
            indikator: item.indikator
          })));
        }
      } catch (err) {
        console.error('Error loading curriculum:', err);
        setError('Gagal memuat data kurikulum.');
      } finally {
        setLoading(false);
      }
    };
    loadCurriculum();
  }, [supabase, user]);

  const handleToggleTP = (tp: CurriculumEntry) => {
    if (selectedTPs.find(t => t.id === tp.id)) {
      setSelectedTPs(selectedTPs.filter(t => t.id !== tp.id));
    } else {
      if (selectedTPs.length >= 10) {
        alert('Maksimal 10 TP untuk satu minggu agar pembelajaran tetap fokus.');
        return;
      }
      setSelectedTPs([...selectedTPs, tp]);
    }
  };

  const handleGenerate = async () => {
    if (!formData.tema || selectedTPs.length === 0) {
      setError('Mohon isi tema dan pilih minimal satu TP.');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const prompt = `
        Tugas Anda adalah membuat Rencana Pelaksanaan Pembelajaran Mingguan (PPM) untuk PAUD/TK.
        
        INFORMASI UMUM:
        - Tema: ${formData.tema}
        - Sub Tema: ${formData.subTema}
        - Usia: ${formData.usia}
        - Minggu/Semester: ${formData.minggu}/${formData.semester}
        
        TUJUAN PEMBELAJARAN (TP) YANG DIPILIH:
        ${selectedTPs.map(t => `- [${t.subElemen}] ${t.tp}`).join('\n')}
        
        FORMAT OUTPUT HARUS JSON dengan struktur berikut:
        {
          "penyambutan": {
            "senin": "...", "selasa": "...", "rabu": "...", "kamis": "...", "jumat": "..."
          },
          "pembukaan": ["Berdoa", "Salam", "Absensi", "Menanyakan Kabar"],
          "memahami": ["Poin 1", "Poin 2", "Poin 3"],
          "kegiatanHarian": {
            "senin": "...", "selasa": "...", "rabu": "...", "kamis": "...", "jumat": "..."
          },
          "kegiatanInti": {
            "senin": ["Kegiatan 1", "Kegiatan 2"],
            "selasa": ["Kegiatan 1", "Kegiatan 2"],
            "rabu": ["Kegiatan 1", "Kegiatan 2"],
            "kamis": ["Kegiatan 1", "Kegiatan 2"],
            "jumat": ["Kegiatan 1", "Kegiatan 2"]
          },
          "mengaplikasi": ["Poin 1", "Poin 2"],
          "merefleksi": ["Poin 1", "Poin 2"]
        }

        PENTING:
        1. Sesuaikan kegiatan dengan Tema "${formData.tema}" dan Sub Tema "${formData.subTema}".
        2. Pastikan kegiatan inti mencerminkan TP yang dipilih.
        3. Gunakan bahasa yang ramah anak dan kreatif.
        4. Untuk "penyambutan", berikan variasi seperti Upacara, Senam, Permainan Tradisional, atau Sholat Dhuha.
      `;

      const result = await generateJSON(prompt);
      const fullData: PPMData = {
        ...result,
        informasiUmum: {
          ...formData,
          mingguSemester: `Minggu ke-${formData.minggu} / Semester ${formData.semester}`,
        },
        asesmenAwal: { deskripsi: '', poinPoin: [], instrumen: [] },
        identifikasi: { dimensiProfilLulusan: [] },
        desainPembelajaran: {
          tujuanPembelajaran: selectedTPs.map(t => t.tp),
          praktikPedagogis: [],
          kemitraan: { orangTua: [], lingkunganSekolah: [], lingkunganPembelajaran: [] },
          pemanfaatanDigital: []
        },
        pengalamanBelajar: {
          penyambutan: '',
          jadwalHarian: [],
          pembukaan: result.pembukaan || [],
          memahami: result.memahami || [],
          kegiatanInti: Object.entries(result.kegiatanInti || {}).map(([hari, kegiatan]) => ({ hari, kegiatan: kegiatan as string[] })),
          mengaplikasi: result.mengaplikasi || [],
          merefleksi: result.merefleksi || [],
          penutup: ''
        },
        asesmenPembelajaran: ''
      };
      setGeneratedPPM(fullData);
      if (onGenerate) onGenerate(fullData);
      setStep(3);
    } catch (err) {
      console.error('Error generating PPM:', err);
      setError('Gagal membuat PPM. Silakan coba lagi.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 text-center relative">
          <button 
            onClick={onBack}
            className="absolute left-0 top-0 p-2 rounded-full hover:bg-stone-200 transition-colors"
            title="Kembali"
          >
            <ArrowLeft size={24} className="text-stone-600" />
          </button>
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles size={14} />
            AI PPM Generator
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-light mb-4 tracking-tight">
            Buat <span className="text-emerald-600 italic">Rencana Mingguan</span>
          </h1>
          <p className="text-stone-500 max-w-xl mx-auto">
            Susun PPM otomatis berdasarkan database kurikulum Anda hanya dalam hitungan detik.
          </p>
        </header>

        {/* Steps Indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step === s ? 'bg-emerald-600 text-white scale-110 shadow-lg' : 
                  step > s ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-stone-300 border border-stone-200'
                }`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-emerald-200' : 'bg-stone-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 1: Info Umum */}
        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-stone-100"
          >
            <h2 className="text-2xl font-serif mb-6 flex items-center gap-3">
              <FileText className="text-emerald-600" />
              Informasi Umum
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Tema Utama</label>
                <input 
                  type="text" 
                  value={formData.tema}
                  onChange={(e) => setFormData({...formData, tema: e.target.value})}
                  placeholder="Contoh: Budaya Nusantara"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Sub Tema</label>
                <input 
                  type="text" 
                  value={formData.subTema}
                  onChange={(e) => setFormData({...formData, subTema: e.target.value})}
                  placeholder="Contoh: Cerita Rakyat"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Kelompok Usia</label>
                <select 
                  value={formData.usia}
                  onChange={(e) => setFormData({...formData, usia: e.target.value})}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                >
                  <option>4-5 tahun (TK A)</option>
                  <option>5-6 tahun (TK B)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Minggu Ke-</label>
                <input 
                  type="number" 
                  value={formData.minggu}
                  onChange={(e) => setFormData({...formData, minggu: e.target.value})}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setStep(2)}
                disabled={!formData.tema}
                className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                Lanjut Pilih TP
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Pilih TP */}
        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-serif mb-2">Pilih Tujuan Pembelajaran (TP)</h2>
                <p className="text-stone-500 text-sm">Pilih 4-8 TP yang ingin dicapai minggu ini.</p>
              </div>
              <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold border border-emerald-100">
                {selectedTPs.length} TP Terpilih
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {curriculum.map((tp) => (
                <div 
                  key={tp.id}
                  onClick={() => handleToggleTP(tp)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                    selectedTPs.find(t => t.id === tp.id) 
                    ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500/20' 
                    : 'bg-white border-stone-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
                      {tp.subElemen}
                    </span>
                  </div>
                  <p className="text-sm text-stone-700 line-clamp-3 leading-relaxed">{tp.tp}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-12">
              <button 
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-stone-500 font-medium hover:text-stone-800 transition-colors"
              >
                <ChevronLeft size={20} />
                Kembali
              </button>
              <button 
                onClick={handleGenerate}
                disabled={generating || selectedTPs.length === 0}
                className="flex items-center gap-2 bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/30 disabled:opacity-50"
              >
                {generating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                {generating ? 'Sedang Menyusun...' : 'Generate PPM Sekarang'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Hasil PPM */}
        {step === 3 && generatedPPM && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif">Draf PPM Mingguan</h2>
              <div className="flex gap-3">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 bg-white border border-stone-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors shadow-sm"
                >
                  <Download size={18} />
                  Download PDF
                </button>
                <button 
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 bg-stone-800 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-stone-900 transition-colors shadow-sm"
                >
                  Edit TP
                </button>
              </div>
            </div>

            {/* Preview Table */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-100 print:shadow-none print:border-stone-800">
              <div className="p-8 border-b border-stone-100 bg-stone-50/50">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex border-b border-stone-100 pb-2">
                      <span className="w-32 text-xs font-bold text-stone-400 uppercase">Tema Sub</span>
                      <span className="font-medium">{formData.subTema}</span>
                    </div>
                    <div className="flex border-b border-stone-100 pb-2">
                      <span className="w-32 text-xs font-bold text-stone-400 uppercase">Tema</span>
                      <span className="font-medium">{formData.tema}</span>
                    </div>
                    <div className="flex border-b border-stone-100 pb-2">
                      <span className="w-32 text-xs font-bold text-stone-400 uppercase">Usia</span>
                      <span className="font-medium">{formData.usia}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex border-b border-stone-100 pb-2">
                      <span className="w-32 text-xs font-bold text-stone-400 uppercase">Minggu/Sem</span>
                      <span className="font-medium">{formData.minggu} / {formData.semester}</span>
                    </div>
                    <div className="flex border-b border-stone-100 pb-2">
                      <span className="w-32 text-xs font-bold text-stone-400 uppercase">Waktu</span>
                      <span className="font-medium">{formData.alokasiWaktu}</span>
                    </div>
                    <div className="flex border-b border-stone-100 pb-2">
                      <span className="w-32 text-xs font-bold text-stone-400 uppercase">Hari</span>
                      <span className="font-medium">{formData.hariTanggal}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-0">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-emerald-50/50">
                      <th className="p-4 border border-stone-100 text-[10px] font-bold uppercase tracking-widest text-emerald-800 w-1/5">Senin</th>
                      <th className="p-4 border border-stone-100 text-[10px] font-bold uppercase tracking-widest text-emerald-800 w-1/5">Selasa</th>
                      <th className="p-4 border border-stone-100 text-[10px] font-bold uppercase tracking-widest text-emerald-800 w-1/5">Rabu</th>
                      <th className="p-4 border border-stone-100 text-[10px] font-bold uppercase tracking-widest text-emerald-800 w-1/5">Kamis</th>
                      <th className="p-4 border border-stone-100 text-[10px] font-bold uppercase tracking-widest text-emerald-800 w-1/5">Jumat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Penyambutan */}
                    <tr>
                      <td className="p-4 border border-stone-100 text-xs italic text-stone-500">{generatedPPM.penyambutan?.senin}</td>
                      <td className="p-4 border border-stone-100 text-xs italic text-stone-500">{generatedPPM.penyambutan?.selasa}</td>
                      <td className="p-4 border border-stone-100 text-xs italic text-stone-500">{generatedPPM.penyambutan?.rabu}</td>
                      <td className="p-4 border border-stone-100 text-xs italic text-stone-500">{generatedPPM.penyambutan?.kamis}</td>
                      <td className="p-4 border border-stone-100 text-xs italic text-stone-500">{generatedPPM.penyambutan?.jumat}</td>
                    </tr>
                    {/* Pembukaan */}
                    <tr className="bg-stone-50/30">
                      <td colSpan={5} className="p-4 border border-stone-100">
                        <div className="font-bold text-[10px] uppercase tracking-widest text-stone-400 mb-2">Pembukaan</div>
                        <div className="flex gap-4 text-xs font-medium">
                          {generatedPPM.pembukaan?.map((item, i) => (
                            <span key={i} className="flex items-center gap-1">
                              <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                              {item}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                    {/* Memahami */}
                    <tr>
                      <td colSpan={5} className="p-4 border border-stone-100">
                        <div className="font-bold text-[10px] uppercase tracking-widest text-stone-400 mb-2">Memahami</div>
                        <ul className="list-decimal list-inside text-xs space-y-1">
                          {generatedPPM.memahami?.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      </td>
                    </tr>
                    {/* Kegiatan Harian */}
                    <tr className="bg-blue-50/30">
                      <td className="p-4 border border-stone-100 text-xs font-medium">{generatedPPM.kegiatanHarian?.senin}</td>
                      <td className="p-4 border border-stone-100 text-xs font-medium">{generatedPPM.kegiatanHarian?.selasa}</td>
                      <td className="p-4 border border-stone-100 text-xs font-medium">{generatedPPM.kegiatanHarian?.rabu}</td>
                      <td className="p-4 border border-stone-100 text-xs font-medium">{generatedPPM.kegiatanHarian?.kamis}</td>
                      <td className="p-4 border border-stone-100 text-xs font-medium">{generatedPPM.kegiatanHarian?.jumat}</td>
                    </tr>
                    {/* Kegiatan Inti */}
                    <tr>
                      <td className="p-4 border border-stone-100 align-top">
                        <div className="font-bold text-[10px] uppercase tracking-widest text-stone-400 mb-2">Kegiatan Inti</div>
                        <ul className="list-disc list-inside text-xs space-y-2">
                          {generatedPPM.kegiatanInti?.senin.map((item, i) => <li key={i} className="leading-relaxed">{item}</li>)}
                        </ul>
                      </td>
                      <td className="p-4 border border-stone-100 align-top">
                        <div className="font-bold text-[10px] uppercase tracking-widest text-stone-400 mb-2">Kegiatan Inti</div>
                        <ul className="list-disc list-inside text-xs space-y-2">
                          {generatedPPM.kegiatanInti?.selasa.map((item, i) => <li key={i} className="leading-relaxed">{item}</li>)}
                        </ul>
                      </td>
                      <td className="p-4 border border-stone-100 align-top">
                        <div className="font-bold text-[10px] uppercase tracking-widest text-stone-400 mb-2">Kegiatan Inti</div>
                        <ul className="list-disc list-inside text-xs space-y-2">
                          {generatedPPM.kegiatanInti?.rabu.map((item, i) => <li key={i} className="leading-relaxed">{item}</li>)}
                        </ul>
                      </td>
                      <td className="p-4 border border-stone-100 align-top">
                        <div className="font-bold text-[10px] uppercase tracking-widest text-stone-400 mb-2">Kegiatan Inti</div>
                        <ul className="list-disc list-inside text-xs space-y-2">
                          {generatedPPM.kegiatanInti?.kamis.map((item, i) => <li key={i} className="leading-relaxed">{item}</li>)}
                        </ul>
                      </td>
                      <td className="p-4 border border-stone-100 align-top">
                        <div className="font-bold text-[10px] uppercase tracking-widest text-stone-400 mb-2">Kegiatan Inti</div>
                        <ul className="list-disc list-inside text-xs space-y-2">
                          {generatedPPM.kegiatanInti?.jumat.map((item, i) => <li key={i} className="leading-relaxed">{item}</li>)}
                        </ul>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-center pb-12">
              <button 
                onClick={() => setStep(1)}
                className="text-stone-400 hover:text-stone-600 text-sm font-medium transition-colors"
              >
                Buat PPM Baru
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
