import React, { useState, useRef } from 'react';
import { PPMData } from '../../services/pdfService';
import { ArrowLeft, Palette, Plus, Trash2, Download, Sparkles, Loader2, Save, Image as ImageIcon, X, Clock, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { generateText } from '../../services/aiService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { User } from '@supabase/supabase-js';
import { assessmentService } from '../../services/assessmentService';
import PPMWeekSelector from '../ppm/PPMWeekSelector';

interface HasilKaryaGeneratorProps {
  onBack: () => void;
  ppmData: PPMData;
  user: User | null;
}

interface Artwork {
  id: string;
  date: string;
  time: string;
  studentName: string;
  imageUrl: string;
  description: string; // Deskripsi karya
  analysis: string; // Analisis capaian (AI)
  activity: string; // Kegiatan dari PPM
}

export default function HasilKaryaGenerator({ onBack, ppmData: initialPpmData, user }: HasilKaryaGeneratorProps) {
  const [ppmData, setPpmData] = useState<PPMData>(initialPpmData);
  const [selectedGroup, setSelectedGroup] = useState<'Kelompok A' | 'Kelompok B'>('Kelompok B');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveHistory = async () => {
    if (!user || artworks.length === 0) return;
    
    setIsSaving(true);
    try {
      const historyData = {
        ppmId: ppmData.id,
        group: selectedGroup,
        artworks,
        schoolName: ppmData.schoolName,
        teacherName: ppmData.teacherName,
        tema: ppmData.informasiUmum.tema,
        subTema: ppmData.informasiUmum.subTema
      };

      await assessmentService.saveAssessment(user.id, 'hasil_karya', historyData);
      alert('Riwayat asesmen berhasil disimpan!');
    } catch (error) {
      console.error('Error saving assessment history:', error);
      alert('Gagal menyimpan riwayat asesmen.');
    } finally {
      setIsSaving(false);
    }
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('Senin');
  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [studentName, setStudentName] = useState('');
  const [description, setDescription] = useState(''); // Deskripsi manual dari guru
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const getActivitiesForDay = (day: string) => {
    if (!ppmData?.pengalamanBelajar?.kegiatanInti) return [];
    const dayActivity = ppmData.pengalamanBelajar.kegiatanInti.find(
      k => k.hari.toLowerCase() === day.toLowerCase()
    );
    return Array.isArray(dayActivity?.kegiatan) ? dayActivity.kegiatan : [];
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAnalysis = async () => {
    if (!studentName || !selectedImage || !description || !selectedActivity) return;

    setLoadingAI(true);
      try {
        const prompt = `
          Saya adalah guru TK. Saya ingin membuat analisis capaian perkembangan anak berdasarkan hasil karyanya.
          
          Konteks Kegiatan: ${selectedActivity}
          
          Data Anak:
          - Nama Anak: ${studentName}
          - Deskripsi Karya (dari guru): ${description}
          - Topik Pembelajaran: ${ppmData.informasiUmum.tema} / ${ppmData.informasiUmum.subTema}
          
          Tugas:
          Buat analisis singkat (maksimal 2-3 kalimat) dalam satu paragraf padat.
          Fokus pada capaian utama yang terlihat.
          Gunakan gaya bahasa: "Ananda berkembang sesuai harapan dalam [kemampuan]..."
          Jangan gunakan bullet points atau penomoran. Langsung deskripsi naratif.
        `;

        const analysis = await generateText(prompt);

        const newArtwork: Artwork = {
          id: Date.now().toString(),
          date: selectedDate,
          time: selectedTime,
          studentName,
          imageUrl: selectedImage,
          description,
          analysis,
          activity: selectedActivity
        };

        setArtworks([...artworks, newArtwork]);
        
        // Reset form
        setStudentName('');
        setDescription('');
        setSelectedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        setLoadingAI(false);
      } catch (error: any) {
        alert('Gagal membuat analisis AI. Silakan coba lagi atau isi secara manual.');
        setLoadingAI(false);
      }
    };

  const handleDeleteArtwork = (id: string) => {
    setArtworks(artworks.filter(a => a.id !== id));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const cropImageToRatio = (base64: string, targetRatio: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64);
          return;
        }

        const imgRatio = img.width / img.height;
        let sw, sh, sx, sy;

        if (imgRatio > targetRatio) {
          // Image is wider than target ratio
          sh = img.height;
          sw = img.height * targetRatio;
          sx = (img.width - sw) / 2;
          sy = 0;
        } else {
          // Image is taller than target ratio
          sw = img.width;
          sh = img.width / targetRatio;
          sx = 0;
          sy = (img.height - sh) / 2;
        }

        canvas.width = sw;
        canvas.height = sh;
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => resolve(base64);
      img.src = base64;
    });
  };

  const handleDownloadPDF = async () => {
    if (artworks.length === 0) {
      alert('Belum ada data karya untuk diunduh.');
      return;
    }

    setIsGenerating(true);
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    
    // Pre-process images to crop them to 2:3 ratio for uniform look
    const processedArtworks = await Promise.all(artworks.map(async (artwork) => {
      if (!artwork.imageUrl) return artwork;
      const croppedUrl = await cropImageToRatio(artwork.imageUrl, 1 / 1.5); // 2:3 ratio (Portrait)
      return { ...artwork, imageUrl: croppedUrl };
    }));
    
    // Header
    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.text('ASESMEN HASIL KARYA', 105, 15, { align: 'center' });
    
    doc.setFontSize(10.5);
    doc.setFont('times', 'normal');
    
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

    const tableStartY = startY + (infoLabels.length * lineHeight) + 8;

    const tableHead = [
      [
        { content: 'No', styles: { halign: 'center' as const, valign: 'middle' as const } },
        { content: 'Hari\nTanggal', styles: { halign: 'center' as const, valign: 'middle' as const } },
        { content: 'Nama Anak', styles: { halign: 'center' as const, valign: 'middle' as const } },
        { content: 'Waktu', styles: { halign: 'center' as const, valign: 'middle' as const } },
        { content: 'Dokumentasi', styles: { halign: 'center' as const, valign: 'middle' as const } },
        { content: 'Keterangan', styles: { halign: 'center' as const, valign: 'middle' as const } }
      ]
    ];

    const tableBody = processedArtworks.map((item, index) => [
      index + 1,
      formatDate(item.date),
      item.studentName,
      item.time,
      '', // Placeholder for image
      `Kegiatan: ${item.activity}\n\n${item.analysis}`
    ]);

    autoTable(doc, {
      startY: tableStartY,
      head: tableHead,
      body: tableBody,
      theme: 'grid',
      styles: {
        font: 'times',
        fontSize: 10.5,
        cellPadding: 1.5,
        valign: 'middle' as const,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        textColor: [0, 0, 0],
        minCellHeight: 50.5
      },
      headStyles: {
        font: 'times',
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center' as const,
        valign: 'middle' as const,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        minCellHeight: 10 // Compact header
      },
      bodyStyles: {
        font: 'times',
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' as const }, // No
        1: { cellWidth: 30, halign: 'center' as const }, // Hari/Tanggal
        2: { cellWidth: 30, halign: 'center' as const }, // Nama Anak
        3: { cellWidth: 20, halign: 'center' as const }, // Waktu
        4: { cellWidth: 35, halign: 'center' as const }, // Dokumentasi
        5: { cellWidth: 'auto' } // Keterangan
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          const artwork = processedArtworks[data.row.index];
          if (artwork && artwork.imageUrl) {
            try {
              const padding = 2;
              const cellWidth = data.cell.width - (padding * 2);
              const cellHeight = data.cell.height - (padding * 2);
              const cellX = data.cell.x + padding;
              const cellY = data.cell.y + padding;

              // Since we already cropped to 2:3 ratio, we can just fill the cell
              // but we still calculate to be safe
              const imgProps = doc.getImageProperties(artwork.imageUrl);
              const imgRatio = imgProps.width / imgProps.height;
              const cellRatio = cellWidth / cellHeight;

              let drawW, drawH;
              if (imgRatio > cellRatio) {
                drawW = cellWidth;
                drawH = cellWidth / imgRatio;
              } else {
                drawH = cellHeight;
                drawW = cellHeight * imgRatio;
              }

              const drawX = cellX + (cellWidth - drawW) / 2;
              const drawY = cellY + (cellHeight - drawH) / 2;

              doc.addImage(artwork.imageUrl, 'JPEG', drawX, drawY, drawW, drawH);
            } catch (e) {
              console.error('Error adding image to PDF', e);
            }
          }
        }
      }
    });

    // Signatures
    let finalY = (doc as any).lastAutoTable.finalY + 10;
    const pageHeight = doc.internal.pageSize.height;
    
    if (finalY + 45 > pageHeight) {
      doc.addPage();
      finalY = 25;
    }

    doc.setFontSize(10);
    doc.text('Mengetahui', 50, finalY, { align: 'center' });
    doc.text('Kepala Sekolah', 50, finalY + 5, { align: 'center' });
    doc.setFont('times', 'bold');
    doc.text(ppmData.principalName || 'KUNLISTYANI, S.Pd', 50, finalY + 30, { align: 'center' });

    doc.setFont('times', 'normal');
    doc.text(`Guru Kelas ${selectedGroup.split(' ')[1]}`, 160, finalY + 5, { align: 'center' });
    doc.setFont('times', 'bold');
    doc.text(ppmData.teacherName || 'NABILA ANIN SAU\'DAH', 160, finalY + 30, { align: 'center' });

    doc.save(`Asesmen_Hasil_Karya_${ppmData.schoolName || 'TK'}.pdf`);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center relative">
          <button 
            onClick={onBack}
            className="absolute left-0 top-0 p-2 rounded-full hover:bg-stone-200 transition-colors"
            title="Kembali"
          >
            <ArrowLeft size={24} className="text-stone-600" />
          </button>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 flex items-center justify-center gap-3">
            <Palette className="text-orange-600" size={32} />
            Asesmen Hasil Karya
          </h1>
        </header>

        <div className="mb-8 max-w-md mx-auto space-y-4">
          <PPMWeekSelector 
            currentPpm={ppmData} 
            onSelect={setPpmData} 
            onGroupChange={setSelectedGroup}
            user={user} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Input Form */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
              <h3 className="font-bold text-stone-800 mb-6 flex items-center gap-2">
                <Plus size={18} className="text-emerald-600" />
                Tambah Karya
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Tanggal</label>
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={handleDateChange}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Hari</label>
                    <select 
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20"
                    >
                      {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Kegiatan (Dari PPM)</label>
                  <select 
                    value={selectedActivity}
                    onChange={(e) => setSelectedActivity(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20 text-sm"
                  >
                    <option value="">-- Pilih Kegiatan --</option>
                    {activities.map((act, idx) => (
                      <option key={idx} value={act}>{act}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Waktu</label>
                  <div className="relative">
                    <input 
                      type="time" 
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:w-6 [&::-webkit-calendar-picker-indicator]:h-6 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    />
                    <Clock className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={16} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Nama Anak</label>
                  <input 
                    type="text" 
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Nama Siswa"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Foto Karya</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-stone-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-stone-50 transition-colors"
                  >
                    {selectedImage ? (
                      <div className="relative w-full aspect-video">
                        <img src={selectedImage} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                          className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-red-500 hover:bg-white"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="text-stone-300 mb-2" size={32} />
                        <span className="text-sm text-stone-500">Klik untuk upload foto</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Deskripsi Karya (Guru)</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Contoh: Ananda menggambar masjid dengan krayon warna-warni..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 min-h-[80px] outline-none focus:ring-2 focus:ring-orange-500/20 resize-none text-sm"
                  />
                </div>

                <button
                  onClick={handleGenerateAnalysis}
                  disabled={loadingAI || !studentName || !selectedImage || !description || !selectedActivity}
                  className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-600/20"
                >
                  {loadingAI ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  Analisis dengan AI
                </button>
              </div>
            </div>
          </div>

          {/* Right: List & Preview */}
          <div className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 min-h-[600px] flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <Save size={18} className="text-stone-600" />
                  Daftar Hasil Karya ({artworks.length})
                </h2>
                <div className="flex gap-2">
                  {artworks.length > 0 && (
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
                        disabled={isGenerating}
                        className="bg-stone-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-stone-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download size={16} />
                        Unduh PDF
                      </button>
                    </>
                  )}
                </div>
              </div>

              {artworks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-stone-400 border-2 border-dashed border-stone-100 rounded-xl p-8 text-center">
                  <Palette size={48} className="mb-4 opacity-20" />
                  <p>Belum ada data hasil karya.</p>
                  <p className="text-sm mt-2">Upload foto dan isi deskripsi di sebelah kiri.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {artworks.map((item) => (
                    <div key={item.id} className="bg-stone-50 rounded-xl border border-stone-200 overflow-hidden group">
                      <div className="relative aspect-video bg-stone-200">
                        <img src={item.imageUrl} alt={item.studentName} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button 
                            onClick={() => handleDeleteArtwork(item.id)}
                            className="bg-white/90 p-1.5 rounded-full text-red-500 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                          <div className="flex justify-between items-end text-white">
                            <div>
                              <p className="font-bold">{item.studentName}</p>
                              <p className="text-white/80 text-xs">{formatDate(item.date)} • {item.time}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Kegiatan</p>
                          <p className="text-sm text-stone-700 font-medium">{item.activity}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Deskripsi</p>
                          <p className="text-sm text-stone-700 line-clamp-2">{item.description}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                            <Sparkles size={12} /> Analisis AI
                          </p>
                          <p className="text-sm text-stone-600 italic line-clamp-3">{item.analysis}</p>
                        </div>
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
