import React, { useState } from 'react';
import { PPMData } from '../../services/pdfService';
import { ArrowLeft, BookOpen, Plus, Trash2, Download, Sparkles, Loader2, Save, Users, CheckSquare, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { generateJSON } from '../../services/aiService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { User } from '@supabase/supabase-js';
import { getSupabase } from '../../services/supabaseClient';
import { assessmentService } from '../../services/assessmentService';
import PPMWeekSelector from '../ppm/PPMWeekSelector';

interface CeklisGeneratorProps {
  onBack: () => void;
  ppmData: PPMData;
  user: User | null;
}

interface Student {
  id: string;
  name: string;
}

interface AssessmentItem {
  id: string;
  objective: string; // Tujuan Pembelajaran
  iktp: string; // Indikator Ketercapaian
  ratings: Record<string, string>; // studentId -> Rating (BB, MB, BSH, BSB)
}

export default function CeklisGenerator({ onBack, ppmData: initialPpmData, user }: CeklisGeneratorProps) {
  // State
  const [ppmData, setPpmData] = useState<PPMData>(initialPpmData);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('Senin');
  const [selectedGroup, setSelectedGroup] = useState<'Kelompok A' | 'Kelompok B'>('Kelompok B');
  const [students, setStudents] = useState<Student[]>([
    { id: '1', name: 'Arsvila' },
    { id: '2', name: 'Baim' },
    { id: '3', name: 'Caca' },
    { id: '4', name: 'Dafa' },
    { id: '5', name: 'Elang' }
  ]);

  // Update students when group changes
  const handleGroupChange = (group: 'Kelompok A' | 'Kelompok B') => {
    setSelectedGroup(group);
    if (group === 'Kelompok A') {
      setStudents([
        { id: '1', name: 'Geo' },
        { id: '2', name: 'Meera' },
        { id: '3', name: 'Via' },
        { id: '4', name: 'Freya' },
        { id: '5', name: 'Zea' }
      ]);
    } else {
      setStudents([
        { id: '1', name: 'Arsvila' },
        { id: '2', name: 'Baim' },
        { id: '3', name: 'Caca' },
        { id: '4', name: 'Dafa' },
        { id: '5', name: 'Elang' }
      ]);
    }
  };
  const [newStudentName, setNewStudentName] = useState('');
  
  // Assessment Data
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);
  const [assessmentItems, setAssessmentItems] = useState<AssessmentItem[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveHistory = async () => {
    if (!user || assessmentItems.length === 0) return;
    
    setIsSaving(true);
    try {
      const historyData = {
        ppmId: ppmData.id,
        date: selectedDate,
        day: selectedDay,
        group: selectedGroup,
        students,
        items: assessmentItems,
        schoolName: ppmData.schoolName,
        teacherName: ppmData.teacherName,
        tema: ppmData.informasiUmum.tema,
        subTema: ppmData.informasiUmum.subTema
      };

      await assessmentService.saveAssessment(user.id, 'ceklis', historyData);
      alert('Riwayat asesmen berhasil disimpan!');
    } catch (error) {
      console.error('Error saving assessment history:', error);
      alert('Gagal menyimpan riwayat asesmen.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helpers
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateVal = e.target.value;
    setSelectedDate(dateVal);
    if (dateVal) {
      const dateObj = new Date(dateVal);
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const dayName = days[dateObj.getDay()];
      if (['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].includes(dayName)) {
        setSelectedDay(dayName);
      }
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getActivitiesForDay = (day: string) => {
    if (!ppmData?.pengalamanBelajar?.kegiatanInti) return [];
    const dayActivity = ppmData.pengalamanBelajar.kegiatanInti.find(
      k => k.hari.toLowerCase() === day.toLowerCase()
    );
    return dayActivity?.kegiatan || [];
  };

  // Student Management
  const addStudent = () => {
    if (!newStudentName.trim()) return;
    setStudents([...students, { id: Date.now().toString(), name: newStudentName }]);
    setNewStudentName('');
  };

  const removeStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
  };

  // Objective Management
  const toggleObjective = (obj: string) => {
    if (selectedObjectives.includes(obj)) {
      setSelectedObjectives(selectedObjectives.filter(o => o !== obj));
    } else {
      setSelectedObjectives([...selectedObjectives, obj]);
    }
  };

  // AI Generation for IKTP
  const generateIKTP = async () => {
    if (selectedObjectives.length === 0) return;
    
    const supabase = getSupabase();
    if (!supabase) return;

    setLoadingAI(true);
    try {
      // Fetch curriculum context from Supabase
      let curriculumContext = '';
      if (user) {
        const { data: curriculumData, error: curriculumError } = await supabase
          .from('curriculum_entries')
          .select('*')
          .eq('user_id', user.id);
        
        if (!curriculumError && curriculumData && curriculumData.length > 0) {
          curriculumContext = curriculumData.map((e: any) => 
            `TP: ${e.tp}, Indikator: ${e.indikator}`
          ).join('\n');
        }
      }

      const activities = getActivitiesForDay(selectedDay).join(', ');
      
      const prompt = `
        Saya sedang membuat instrumen Ceklis Capaian Perkembangan untuk anak TK.
        
        ${curriculumContext ? `REFERENSI KURIKULUM RESMI (Gunakan ini sebagai panduan utama):
        ${curriculumContext}` : ''}

        Konteks:
        - Kegiatan Hari Ini: ${activities}
        - Tujuan Pembelajaran yang dipilih:
        ${selectedObjectives.map(o => `- ${o}`).join('\n')}
        
        Tugas:
        Untuk SETIAP Tujuan Pembelajaran di atas, buatkan 1-2 Indikator Ketercapaian Tujuan Pembelajaran (IKTP) yang spesifik, terukur, dan relevan dengan kegiatan hari ini. 
        PENTING: Jika Tujuan Pembelajaran yang dipilih ada di dalam REFERENSI KURIKULUM RESMI, gunakan Indikator yang sudah ada di sana. Jika tidak ada, buatkan yang selaras dengan standar tersebut.
        
        Format Output JSON (WAJIB berupa objek dengan key "data"):
        {
          "data": [
            {
              "objective": "Teks Tujuan Pembelajaran Asli",
              "iktp": "Teks Indikator (poin-poin)"
            }
          ]
        }
        Pastikan output hanya JSON valid.
      `;

      const generatedData = await generateJSON(prompt);

      let dataArray = [];
      if (Array.isArray(generatedData)) {
        dataArray = generatedData;
      } else if (generatedData && typeof generatedData === 'object' && Array.isArray(generatedData.data)) {
        dataArray = generatedData.data;
      } else if (generatedData && typeof generatedData === 'object' && Array.isArray(generatedData.iktp)) {
        dataArray = generatedData.iktp;
      } else if (generatedData && typeof generatedData === 'object') {
        // Try to find any array in the object
        const possibleArray = Object.values(generatedData).find(v => Array.isArray(v));
        if (possibleArray) {
          dataArray = possibleArray as any[];
        }
      }

      if (dataArray.length === 0) {
        throw new Error("Format data AI tidak valid atau tidak ditemukan data indikator.");
      }

      const newItems: AssessmentItem[] = dataArray.map((item: any, index: number) => ({
        id: Date.now().toString() + index,
        objective: item.objective || '',
        iktp: item.iktp || '',
        ratings: {} // Empty ratings initially
      }));

      setAssessmentItems(newItems);

    } catch (error) {
      console.error('Error generating IKTP:', error);
      alert('Gagal membuat indikator. Silakan coba lagi.');
    } finally {
      setLoadingAI(false);
    }
  };

  const updateRating = (itemId: string, studentId: string, rating: string) => {
    setAssessmentItems(items => items.map(item => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        ratings: {
          ...item.ratings,
          [studentId]: rating
        }
      };
    }));
  };

  // PDF Generation
  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    
    // Header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ASESMEN CEKLIS', 105, 15, { align: 'center' });
    
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'normal');
    
    const startY = 30;
    const lineHeight = 6;
    
    // School Info
    const infoLabels = [
      { label: 'Nama Sekolah', value: ppmData.schoolName || 'TK BALEGONDO 1' },
      { label: 'Nama Guru Kelas', value: ppmData.teacherName || '' },
      { label: 'Fase/Kelas/Usia', value: `Fondasi/ ${selectedGroup.split(' ')[1]}/ ${(ppmData.informasiUmum.usia || '').split(' ')[0]}` },
      { label: 'Tahun Ajaran', value: (ppmData.academicYear || '').replace('TAHUN PELAJARAN ', '') },
      { label: 'Semester/Bulan', value: (ppmData.informasiUmum.mingguSemester || '').split('/')[1]?.trim() || '' },
      { label: 'Tema / Sub Tema', value: `${ppmData.informasiUmum.tema} / ${ppmData.informasiUmum.subTema}` },
    ];

    infoLabels.forEach((info, index) => {
      doc.text(info.label, 20, startY + (index * lineHeight));
      doc.text(`: ${info.value}`, 60, startY + (index * lineHeight));
    });

    // Table
    const tableStartY = startY + (infoLabels.length * lineHeight) + 8;
    
    // Prepare Table Data
    const tableHead = [
      [
        { content: 'No', rowSpan: 2, styles: { valign: 'middle' as const, halign: 'center' as const } },
        { content: 'Hari\nTanggal', rowSpan: 2, styles: { valign: 'middle' as const, halign: 'center' as const } },
        { content: 'Tujuan\nPembelajaran', rowSpan: 2, styles: { valign: 'middle' as const, halign: 'center' as const } },
        { content: 'Indikator Ketercapaian\nTujuan Pembelajaran (IKTP)', rowSpan: 2, styles: { valign: 'middle' as const, halign: 'center' as const } },
        { content: 'Nama Anak', colSpan: students.length, styles: { halign: 'center' as const, fontStyle: 'bold' as const } }
      ],
      students.map(s => s.name)
    ];

    const tableBody = assessmentItems.map((item, index) => {
      const row = [
        index + 1,
        selectedDate ? formatDate(selectedDate) : selectedDay,
        item.objective,
        item.iktp.replace(/\s2\.\s/g, '\n\n2. '),
        ...students.map(s => item.ratings[s.id] || '-')
      ];
      return row;
    });

    // Calculate column widths
    const pageWidth = doc.internal.pageSize.width;
    const margin = 14; // default autoTable margin
    const availableWidth = pageWidth - (margin * 2);
    
    // Adjusted for Portrait (Total approx 182mm available)
    const fixedColumnsWidth = 8 + 20 + 35 + 45; // No + Hari + Tujuan + IKTP = 108mm
    const remainingWidth = availableWidth - fixedColumnsWidth;
    const studentColWidth = remainingWidth / Math.max(students.length, 1);

    const columnStyles: any = {
      0: { cellWidth: 8, halign: 'center' as const }, // No
      1: { cellWidth: 20 }, // Hari/Tanggal
      2: { cellWidth: 35 }, // Tujuan
      3: { cellWidth: 45 }, // IKTP
    };

    // Apply dynamic width to student columns (starting from index 4)
    students.forEach((_, index) => {
      columnStyles[4 + index] = { cellWidth: studentColWidth, halign: 'center', fontSize: 7 };
    });

    autoTable(doc, {
      startY: tableStartY,
      head: tableHead,
      body: tableBody,
      theme: 'grid',
      styles: {
        fontSize: 10.5,
        cellPadding: 1.5,
        valign: 'middle',
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        textColor: [0, 0, 0],
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center' as const,
        valign: 'middle' as const,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fontSize: 10.5
      },
      columnStyles: columnStyles
    });

    // Signatures
    let finalY = (doc as any).lastAutoTable.finalY + 20;
    const pageHeight = doc.internal.pageSize.height;
    
    if (finalY + 40 > pageHeight) {
      doc.addPage();
      finalY = 20;
    }

    // Adjust signature positions for Portrait
    // Center is 105
    doc.text('Mengetahui', 50, finalY, { align: 'center' });
    doc.text('Kepala Sekolah', 50, finalY + 5, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text(ppmData.principalName || 'KUNLISTYANI, S.Pd', 50, finalY + 30, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.text(`Guru Kelas ${selectedGroup.split(' ')[1]}`, 160, finalY + 5, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text(ppmData.teacherName || 'NABILA ANIN SAU\'DAH', 160, finalY + 30, { align: 'center' });

    doc.save('Asesmen_Ceklis.pdf');
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
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 flex items-center justify-center gap-3">
            <CheckSquare className="text-blue-600" size={32} />
            Ceklis Capaian Perkembangan
          </h1>
        </header>

        <div className="mb-8 max-w-md mx-auto">
          <PPMWeekSelector 
            currentPpm={ppmData} 
            onSelect={setPpmData} 
            onGroupChange={handleGroupChange}
            user={user} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar: Configuration */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Date & Day */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
              <h3 className="font-bold text-stone-800 mb-6 flex items-center gap-2">
                <BookOpen size={18} className="text-emerald-600" />
                Waktu & Kegiatan
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Tanggal</label>
                  <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={handleDateChange}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Hari</label>
                  <input 
                    type="text" 
                    value={selectedDay} 
                    readOnly 
                    className="w-full bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-500 cursor-not-allowed"
                  />
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs font-bold text-blue-800 mb-1">Kegiatan Hari Ini:</p>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    {getActivitiesForDay(selectedDay).join(', ') || 'Tidak ada kegiatan terjadwal'}
                  </p>
                </div>
              </div>
            </div>

            {/* Student List */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
              <h3 className="font-bold text-stone-800 mb-6 flex items-center gap-2">
                <Users size={18} className="text-emerald-600" />
                Daftar Siswa ({students.length})
              </h3>
              <div className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Nama Siswa"
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button 
                  onClick={addStudent}
                  className="bg-stone-800 text-white p-2 rounded-xl hover:bg-stone-900"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {students.map(student => (
                  <div key={student.id} className="bg-stone-100 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium text-stone-700 group">
                    {student.name}
                    <button onClick={() => removeStudent(student.id)} className="text-stone-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Objectives Selection */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
              <h3 className="font-bold text-stone-800 mb-6 flex items-center gap-2">
                <CheckSquare size={18} className="text-emerald-600" />
                Pilih Tujuan Pembelajaran
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {ppmData.desainPembelajaran.tujuanPembelajaran.map((obj, idx) => (
                  <label key={idx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-stone-50 cursor-pointer border border-transparent hover:border-stone-100 transition-all">
                    <input 
                      type="checkbox" 
                      checked={selectedObjectives.includes(obj)}
                      onChange={() => toggleObjective(obj)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-stone-600 leading-relaxed">{obj}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={generateIKTP}
                disabled={selectedObjectives.length === 0 || loadingAI}
                className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20"
              >
                {loadingAI ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                Generate Indikator (IKTP)
              </button>
            </div>

          </div>

          {/* Right Content: Assessment Table */}
          <div className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 min-h-[600px] flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <Save size={18} className="text-stone-600" />
                  Tabel Asesmen
                </h2>
                <div className="flex gap-2">
                  {assessmentItems.length > 0 && (
                    <>
                      <button 
                        onClick={handleSaveHistory}
                        disabled={isSaving}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Simpan Riwayat
                      </button>
                      <button 
                        onClick={handleDownloadPDF}
                        className="bg-stone-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-stone-900 transition-colors"
                      >
                        <Download size={16} />
                        Unduh PDF
                      </button>
                    </>
                  )}
                </div>
              </div>

              {assessmentItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-stone-400 border-2 border-dashed border-stone-100 rounded-xl p-8 text-center">
                  <CheckSquare size={48} className="mb-4 opacity-20" />
                  <p>Belum ada data asesmen.</p>
                  <p className="text-sm mt-2">Pilih Tujuan Pembelajaran di sebelah kiri lalu klik "Generate Indikator".</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-3 border border-stone-200 bg-stone-50 text-left text-xs font-bold uppercase tracking-wider text-stone-500 w-1/3">Tujuan & Indikator</th>
                        {students.map(student => (
                          <th key={student.id} className="p-3 border border-stone-200 bg-stone-50 text-center text-xs font-bold uppercase tracking-wider text-stone-500 min-w-[80px]">
                            {student.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {assessmentItems.map((item) => (
                        <tr key={item.id} className="hover:bg-stone-50/50">
                          <td className="p-4 border border-stone-200">
                            <div className="mb-2">
                              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Tujuan</span>
                              <p className="text-sm text-stone-800 mt-1">{item.objective}</p>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">IKTP</span>
                              <p className="text-sm text-stone-600 mt-1 italic">{item.iktp}</p>
                            </div>
                          </td>
                          {students.map(student => (
                            <td key={student.id} className="p-2 border border-stone-200 text-center">
                              <select
                                value={item.ratings[student.id] || ''}
                                onChange={(e) => updateRating(item.id, student.id, e.target.value)}
                                className={`w-full p-1.5 rounded text-xs font-bold border outline-none cursor-pointer
                                  ${!item.ratings[student.id] ? 'bg-white border-stone-200 text-stone-400' : ''}
                                  ${item.ratings[student.id] === 'BB' ? 'bg-red-50 border-red-200 text-red-700' : ''}
                                  ${item.ratings[student.id] === 'MB' ? 'bg-orange-50 border-orange-200 text-orange-700' : ''}
                                  ${item.ratings[student.id] === 'BSH' ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
                                  ${item.ratings[student.id] === 'BSB' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : ''}
                                `}
                              >
                                <option value="">-</option>
                                <option value="BB">BB</option>
                                <option value="MB">MB</option>
                                <option value="BSH">BSH</option>
                                <option value="BSB">BSB</option>
                              </select>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
