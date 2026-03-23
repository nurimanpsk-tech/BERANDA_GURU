import React, { useState } from 'react';
import { PPMData } from '../services/pdfService';
import { ArrowLeft, BookOpen, Plus, Trash2, Download, Sparkles, Loader2, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AnekdotGeneratorProps {
  onBack: () => void;
  ppmData: PPMData;
}

interface AnecdoteItem {
  id: string;
  date: string;
  studentName: string;
  time: string;
  activity: string; // From PPM
  observation: string; // User input
  description: string; // AI Generated
}

export default function AnekdotGenerator({ onBack, ppmData }: AnekdotGeneratorProps) {
  const [items, setItems] = useState<AnecdoteItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [selectedDay, setSelectedDay] = useState<string>('Senin');
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [customActivity, setCustomActivity] = useState('');
  const [studentName, setStudentName] = useState('');
  const [time, setTime] = useState('');
  const [observation, setObservation] = useState('');

  // Get activities for the selected day
  const getActivitiesForDay = (day: string) => {
    if (!ppmData?.pengalamanBelajar?.kegiatanInti) return [];
    
    // Find the activity object for the selected day (case-insensitive)
    const dayActivity = ppmData.pengalamanBelajar.kegiatanInti.find(
      k => k.hari.toLowerCase() === day.toLowerCase()
    );

    if (dayActivity && Array.isArray(dayActivity.kegiatan)) {
      return dayActivity.kegiatan;
    }
    
    return [];
  };

  const activities = getActivitiesForDay(selectedDay);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateVal = e.target.value;
    setSelectedDate(dateVal);
    
    if (dateVal) {
      const dateObj = new Date(dateVal);
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const dayName = days[dateObj.getDay()];
      setSelectedDay(dayName);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleGenerateDescription = async () => {
    const activityToUse = customActivity || selectedActivity;
    if (!studentName || !activityToUse || !observation) return;
    
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `
        Buatkan deskripsi naratif untuk Catatan Anekdot anak TK (Usia 5-6 tahun).
        
        Data:
        - Nama Anak: ${studentName}
        - Kegiatan: ${activityToUse}
        - Perilaku yang diamati (Poin-poin): ${observation}
        
        Instruksi:
        - Buatlah paragraf naratif yang pedagogis (sekitar 3-5 kalimat).
        - Gunakan bahasa yang positif dan objektif.
        - Fokus pada capaian perkembangan anak.
        - Mulai dengan kalimat seperti "Ananda [Nama] hari ini mengikuti..." atau "Ananda terlihat..."
        - Jangan gunakan markdown atau bullet points. Hanya teks paragraf.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      
      const description = response.text?.trim() || '';
      
      const dateDisplay = selectedDate 
        ? formatDate(selectedDate)
        : `${selectedDay}, ${ppmData.informasiUmum.hariTanggal.split('/')[1] || ''}`;

      const newItem: AnecdoteItem = {
        id: Date.now().toString(),
        date: dateDisplay,
        studentName,
        time,
        activity: activityToUse,
        observation,
        description
      };
      
      setItems([...items, newItem]);
      
      // Reset form (except day/activity/date maybe)
      setStudentName('');
      setObservation('');
      setCustomActivity('');
      // setTime(''); // Keep time maybe?
      
    } catch (error) {
      console.error('Error generating anecdote:', error);
      alert('Gagal membuat deskripsi. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    
    // Header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ASESMEN ANEKDOT', 105, 15, { align: 'center' });
    
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'normal');
    
    const startY = 20;
    const lineHeight = 6;
    
    doc.text(`Nama Sekolah`, 20, startY);
    doc.text(`: ${ppmData.schoolName || 'TK BALEGONDO 1'}`, 60, startY);
    
    doc.text(`Nama Guru Kelas`, 20, startY + lineHeight);
    doc.text(`: ${ppmData.teacherName || ''}`, 60, startY + lineHeight);
    
    doc.text(`Fase/Kelas/Usia`, 20, startY + lineHeight * 2);
    doc.text(`: Fondasi/ B/ ${(ppmData.informasiUmum.usia || '').split(' ')[0]}`, 60, startY + lineHeight * 2);
    
    doc.text(`Tahun Ajaran`, 20, startY + lineHeight * 3);
    doc.text(`: ${(ppmData.academicYear || '').replace('TAHUN PELAJARAN ', '')}`, 60, startY + lineHeight * 3);
    
    doc.text(`Semester/Bulan`, 20, startY + lineHeight * 4);
    doc.text(`: ${(ppmData.informasiUmum.mingguSemester || '').split('/')[1]?.trim() || ''}`, 60, startY + lineHeight * 4);
    
    doc.text(`Tema / Sub Tema`, 20, startY + lineHeight * 5);
    doc.text(`: ${ppmData.informasiUmum.tema} / ${ppmData.informasiUmum.subTema}`, 60, startY + lineHeight * 5);

    // Table
    const tableStartY = startY + lineHeight * 6 + 5;
    
    const tableBody = items.map((item, index) => [
      index + 1,
      item.date,
      item.studentName,
      item.time,
      item.description
    ]);

    autoTable(doc, {
      startY: tableStartY,
      head: [['No', 'Hari\nTanggal', 'Nama Anak', 'Waktu', 'Keterangan']],
      body: tableBody,
      theme: 'grid',
      styles: {
        fontSize: 10.5,
        cellPadding: 1.5,
        valign: 'middle',
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        textColor: [0, 0, 0]
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        minCellHeight: 8
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 'auto' } // Description takes remaining space
      }
    });

    // Signatures
    let finalY = (doc as any).lastAutoTable.finalY + 10;
    const pageHeight = doc.internal.pageSize.height;
    
    if (finalY + 40 > pageHeight) {
      doc.addPage();
      finalY = 20;
    }

    doc.text('Mengetahui', 50, finalY, { align: 'center' });
    doc.text('Kepala Sekolah', 50, finalY + 5, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text(ppmData.principalName || '', 50, finalY + 30, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.text('Guru Kelas B', 160, finalY + 5, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text(ppmData.teacherName || '', 160, finalY + 30, { align: 'center' });

    doc.save('Asesmen_Anekdot.pdf');
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
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
            <BookOpen className="text-blue-600" size={32} />
            Catatan Anekdot
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Input Form */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200"
            >
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Plus size={18} className="text-emerald-600" />
                Tambah Catatan
              </h2>

              <div className="space-y-4">
                {/* Day Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Tanggal</label>
                    <input 
                      type="date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Hari</label>
                    <select 
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Custom Activity / Kejadian Langsung */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Catatan Anekdot / Kejadian Langsung</label>
                  <input 
                    type="text"
                    value={customActivity}
                    onChange={(e) => setCustomActivity(e.target.value)}
                    placeholder="Ketik kejadian langsung di sini..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>

                {/* Activity Selection (From PPM) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Kegiatan (Dari PPM)</label>
                  <select 
                    value={selectedActivity}
                    onChange={(e) => setSelectedActivity(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  >
                    <option value="">-- Pilih Kegiatan --</option>
                    {activities.map((act, idx) => (
                      <option key={idx} value={act}>{act}</option>
                    ))}
                  </select>
                </div>

                {/* Student Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Nama Anak</label>
                  <input 
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Contoh: Arsvila"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Waktu</label>
                  <input 
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="Contoh: 08.00 - 08.30"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Observation */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Perilaku yang Diamati</label>
                  <textarea 
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    placeholder="Contoh: Mengikuti sholat dhuha dengan tertib, tapi belum bisa melipat mukena sendiri."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 min-h-[100px] outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-sm"
                  />
                </div>

                <button
                  onClick={handleGenerateDescription}
                  disabled={loading || !studentName || !(customActivity || selectedActivity) || !observation}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  Generate & Simpan
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Preview List */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 min-h-[600px] flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <Save size={18} className="text-stone-600" />
                  Daftar Catatan ({items.length})
                </h2>
                {items.length > 0 && (
                  <button 
                    onClick={handleDownloadPDF}
                    className="bg-stone-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-stone-900 transition-colors"
                  >
                    <Download size={16} />
                    Unduh PDF
                  </button>
                )}
              </div>

              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-stone-400 border-2 border-dashed border-stone-100 rounded-xl p-8">
                  <BookOpen size={48} className="mb-4 opacity-20" />
                  <p className="text-center">Belum ada catatan anekdot.<br/>Silakan isi form di sebelah kiri.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="bg-stone-50 p-4 rounded-xl border border-stone-100 relative group">
                      <button 
                        onClick={() => handleDeleteItem(item.id)}
                        className="absolute top-4 right-4 text-stone-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Hapus"
                      >
                        <Trash2 size={18} />
                      </button>
                      
                      <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                        <span className="bg-white px-2 py-1 rounded border border-stone-200">{item.date}</span>
                        <span className="bg-white px-2 py-1 rounded border border-stone-200">{item.time}</span>
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">{item.studentName}</span>
                      </div>
                      
                      <p className="text-stone-800 text-sm leading-relaxed">
                        {item.description}
                      </p>
                      
                      <div className="mt-3 pt-3 border-t border-stone-200">
                        <p className="text-xs text-stone-400">
                          <span className="font-bold">Kegiatan:</span> {item.activity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
