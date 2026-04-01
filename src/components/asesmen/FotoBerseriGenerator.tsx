import React, { useState, useRef } from 'react';
import { ArrowLeft, Image as ImageIcon, Plus, Trash2, Download, Camera, BookOpen, Sparkles, Calendar, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PPMData } from '../../services/pdfService';
import { generateText } from '../../services/aiService';
import { User } from '@supabase/supabase-js';
import { assessmentService } from '../../services/assessmentService';
import PPMWeekSelector from '../ppm/PPMWeekSelector';

interface FotoBerseriImage {
  data: string;
  width: number;
  height: number;
}

interface FotoBerseriEntry {
  id: string;
  images: (FotoBerseriImage | null)[]; // 3 images
  description: string;
  selectedActivity?: string;
  date?: string;
  day?: string;
}

interface FotoBerseriGeneratorProps {
  onBack: () => void;
  ppmData: PPMData;
  user: User | null;
}

export default function FotoBerseriGenerator({ onBack, ppmData: initialPpmData, user }: FotoBerseriGeneratorProps) {
  const [ppmData, setPpmData] = useState<PPMData>(initialPpmData);
  const [selectedGroup, setSelectedGroup] = useState<'Kelompok A' | 'Kelompok B'>('Kelompok B');
  const [entries, setEntries] = useState<FotoBerseriEntry[]>([
    { 
      id: '1', 
      images: [null, null, null], 
      description: '',
      date: new Date().toISOString().split('T')[0],
      day: 'Senin'
    }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveHistory = async () => {
    if (!user || entries.length === 0) return;
    
    setIsSaving(true);
    try {
      const historyData = {
        ppmId: ppmData.id,
        group: selectedGroup,
        entries,
        schoolName: ppmData.schoolName,
        teacherName: ppmData.teacherName,
        tema: ppmData.informasiUmum.tema,
        subTema: ppmData.informasiUmum.subTema
      };

      await assessmentService.saveAssessment(user.id, 'foto_berseri', historyData);
      alert('Riwayat asesmen berhasil disimpan!');
    } catch (error) {
      console.error('Error saving assessment history:', error);
      alert('Gagal menyimpan riwayat asesmen.');
    } finally {
      setIsSaving(false);
    }
  };
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleAddEntry = () => {
    setEntries([
      ...entries,
      { 
        id: Math.random().toString(36).substr(2, 9), 
        images: [null, null, null], 
        description: '',
        date: new Date().toISOString().split('T')[0],
        day: 'Senin'
      }
    ]);
  };

  const handleRemoveEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  const handleImageUpload = (entryId: string, imageIndex: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      
      // Create an image object to get dimensions
      const img = new Image();
      img.onload = () => {
        setEntries(prev => prev.map(entry => {
          if (entry.id === entryId) {
            const newImages = [...entry.images];
            newImages[imageIndex] = {
              data: base64,
              width: img.width,
              height: img.height
            };
            return { ...entry, images: newImages };
          }
          return entry;
        }));
      };
      img.src = base64;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (entryId: string, imageIndex: number) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id === entryId) {
        const newImages = [...entry.images];
        newImages[imageIndex] = null;
        return { ...entry, images: newImages };
      }
      return entry;
    }));
  };

  const handleDescriptionChange = (id: string, value: string) => {
    setEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, description: value } : entry
    ));
  };

  const handleActivityChange = (id: string, value: string) => {
    setEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, selectedActivity: value } : entry
    ));
  };

  const handleFieldChange = (id: string, field: 'date' | 'day', value: string) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id === id) {
        const updatedEntry = { ...entry, [field]: value };
        
        // Auto-sync day if date changes
        if (field === 'date' && value) {
          const dateObj = new Date(value);
          const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
          const dayName = days[dateObj.getDay()];
          updatedEntry.day = dayName;
        }
        
        return updatedEntry;
      }
      return entry;
    }));
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
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = () => resolve(base64);
      img.src = base64;
    });
  };

  const generateAiDescription = async (entryId: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    setIsAiLoading(entryId);
    try {
      const activityContext = entry.selectedActivity 
        ? `Kegiatan Spesifik yang didokumentasikan: ${entry.selectedActivity}`
        : `Kegiatan Inti dari PPM:\n${ppmData.pengalamanBelajar.kegiatanInti.map(k => `${k.hari}: ${k.kegiatan.join(', ')}`).join('\n')}`;

      const prompt = `Anda adalah asisten guru PAUD yang ahli dalam membuat dokumentasi Foto Berseri.
Berdasarkan data perencanaan pembelajaran (PPM) berikut:
Tema: ${ppmData.informasiUmum.tema}
Sub Tema: ${ppmData.informasiUmum.subTema}
${activityContext}

Tugas Anda: Buatlah deskripsi naratif sangat singkat untuk 3 foto berseri yang menunjukkan langkah-langkah kegiatan anak secara berurutan.
Deskripsi harus terdiri dari 3 poin utama yang menggambarkan proses:
1. Foto 1: Tahap awal/persiapan (misal: mulai menggunting/menyiapkan bahan).
2. Foto 2: Tahap proses/inti (misal: sedang mewarnai/merakit).
3. Foto 3: Tahap akhir/hasil (misal: hasil karya jadi/label terpasang).

Gunakan bahasa yang profesional namun hangat, fokus pada kemampuan motorik dan keterlibatan anak.
Format output: Langsung berikan 3 poin deskripsi menggunakan simbol bullet (•). Jangan berikan teks pembuka atau penutup.`;

      const generatedText = await generateText(prompt);
      
      // Add double spacing between bullet points for better readability
      const formattedText = generatedText.trim()
        .split('\n')
        .filter(line => line.trim())
        .join('\n\n');
      handleDescriptionChange(entryId, formattedText);
    } catch (error) {
      console.error('AI Generation failed', error);
      alert('Gagal menghasilkan deskripsi otomatis. Silakan coba lagi.');
    } finally {
      setIsAiLoading(null);
    }
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Pre-process images to crop them to 2:3 ratio for uniform look
      const processedEntries = await Promise.all(entries.map(async (entry) => {
        const processedImages = await Promise.all(entry.images.map(async (img) => {
          if (!img || !img.data) return null;
          return await cropImageToRatio(img.data, 1 / 1.5); // 2:3 ratio (Portrait)
        }));
        return { ...entry, processedImages };
      }));
      
      // Header
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('ASESMEN FOTO BERSERI', pageWidth / 2, 15, { align: 'center' });
      doc.text(ppmData.schoolName || 'TK BALEGONDO 1', pageWidth / 2, 22, { align: 'center' });
      
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'normal');
      
      const startY = 40;
      const lineHeight = 6;
      
      // Info Grid - Adjusted for Landscape
      const leftX = 20;
      const midX = pageWidth / 2 + 10;
      
      doc.text(`Fase/ Kelompok/ Semester`, leftX, startY);
      doc.text(`: Fondasi/ ${selectedGroup.split(' ')[1]}/ II`, leftX + 45, startY);
      
      doc.text(`Hari, Tanggal`, leftX, startY + lineHeight);
      let headerDate = '';
      if (entries[0]?.date) {
        const [y, m, d] = entries[0].date.split('-');
        headerDate = `${d}/${m}/${y}`;
      }
      const headerDay = entries[0]?.day || '';
      doc.text(`: ${headerDay}${headerDate ? ', ' + headerDate : ''}`, leftX + 45, startY + lineHeight);
      
      doc.text(`Pengamat`, midX, startY);
      doc.text(`: ${ppmData.teacherName || ''}`, midX + 35, startY);
      
      doc.text(`Topik/ Sub Topik`, midX, startY + lineHeight);
      // Use splitTextToSize to prevent overflow
      const topicText = `: ${ppmData.informasiUmum.tema} / ${ppmData.informasiUmum.subTema}`;
      const splitTopic = doc.splitTextToSize(topicText, pageWidth - (midX + 35) - 10);
      doc.text(splitTopic, midX + 35, startY + lineHeight);

      // Table Header
      const tableStartY = startY + lineHeight * 2 + 8;
      
      autoTable(doc, {
        startY: tableStartY,
        head: [[
          { content: 'RANGKAIAN FOTO', styles: { halign: 'center', fontStyle: 'bold', fillColor: [255, 255, 255], textColor: [0, 0, 0] } },
          { content: 'DESKRIPSI / ANALISIS', styles: { halign: 'center', fontStyle: 'bold', fillColor: [255, 255, 255], textColor: [0, 0, 0] } }
        ]],
        body: processedEntries.map(entry => [
          { content: '', processedImages: entry.processedImages, styles: { minCellHeight: 65, cellWidth: 130 } },
          { content: entry.description, styles: { valign: 'top', cellPadding: 5 } }
        ]),
        theme: 'grid',
        rowPageBreak: 'auto',
        styles: {
          fontSize: 10.5,
          cellPadding: 2.5,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          fillColor: [255, 255, 255], // Ensure white background for all cells
        },
        didDrawCell: (dataHook) => {
          if (dataHook.section === 'body' && dataHook.column.index === 0) {
            const processedImages = (dataHook.cell.raw as any)?.processedImages;
            if (!processedImages) return;
            
            const cell = dataHook.cell;
            const padding = 3;
            
            // Calculate dimensions for 2:3 ratio (Portrait)
            // Width is fixed based on cell width
            const imgWidth = (cell.width - (padding * 4)) / 3;
            const targetRatio = 1.5; // Height = Width * 1.5 (2:3 ratio)
            const imgHeight = imgWidth * targetRatio;
            
            // Center vertically within the cell
            const availableHeight = cell.height - (padding * 2);
            const offsetY = Math.max(0, (availableHeight - imgHeight) / 2);
            
            processedImages.forEach((imgData: string | null, i: number) => {
              if (imgData) {
                const x = cell.x + padding + (i * (imgWidth + padding));
                const y = cell.y + padding + offsetY;
                
                try {
                  // Images are already cropped to 2:3 ratio, so they will fit perfectly
                  doc.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight, undefined, 'FAST');
                } catch (e) {
                  console.error('Error adding image to PDF', e);
                }
              }
            });
          }
        }
      });

      // Signatures
      let finalY = (doc as any).lastAutoTable.finalY + 15;
      
      if (finalY + 40 > pageHeight) {
        doc.addPage();
        finalY = 20;
      }

      doc.setFontSize(10);
      doc.text('Mengetahui,', pageWidth * 0.25, finalY, { align: 'center' });
      doc.text('Kepala Sekolah', pageWidth * 0.25, finalY + 5, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.text(ppmData.principalName || '', pageWidth * 0.25, finalY + 30, { align: 'center' });
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Guru Kelas ${selectedGroup.split(' ')[1]}`, pageWidth * 0.75, finalY + 5, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.text(ppmData.teacherName || '', pageWidth * 0.75, finalY + 30, { align: 'center' });

      doc.save('Asesmen_Foto_Berseri.pdf');
    } catch (error) {
      console.error('PDF Generation failed', error);
    } finally {
      setIsGenerating(false);
    }
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
            <ImageIcon className="text-rose-600" size={32} />
            Asesmen Foto Berseri
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

        <div className="bg-white rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-200 overflow-hidden mb-8">
          <div className="p-6 border-bottom border-stone-100 bg-stone-50/50 mb-4">
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-stone-400 uppercase text-[10px] font-bold tracking-wider block mb-1">Sekolah</span>
                <span className="font-semibold text-stone-700">{ppmData.schoolName || 'TK BALEGONDO 1'}</span>
              </div>
              <div>
                <span className="text-stone-400 uppercase text-[10px] font-bold tracking-wider block mb-1">Tema</span>
                <span className="font-semibold text-stone-700">{ppmData.informasiUmum.tema}</span>
              </div>
              <div>
                <span className="text-stone-400 uppercase text-[10px] font-bold tracking-wider block mb-1">Sub Tema</span>
                <span className="font-semibold text-stone-700">{ppmData.informasiUmum.subTema}</span>
              </div>
              <div>
                <span className="text-stone-400 uppercase text-[10px] font-bold tracking-wider block mb-1">Guru</span>
                <span className="font-semibold text-stone-700">{ppmData.teacherName}</span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            <AnimatePresence initial={false}>
              {entries.map((entry, index) => (
                <motion.div 
                  key={entry.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-6 rounded-2xl border border-stone-200 bg-stone-50/30 relative group"
                >
                  <button 
                    onClick={() => handleRemoveEntry(entry.id)}
                    className="absolute top-4 right-4 p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Photo Grid */}
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Rangkaian Foto (3 Foto)</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[0, 1, 2].map((idx) => (
                          <div 
                            key={idx}
                            onClick={() => fileInputRefs.current[`${entry.id}-${idx}`]?.click()}
                            className={`aspect-[2/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group/img ${
                              entry.images[idx] 
                                ? 'border-stone-200 bg-white' 
                                : 'border-stone-300 bg-stone-100 hover:bg-stone-200 hover:border-stone-400'
                            }`}
                          >
                            {entry.images[idx] ? (
                              <>
                                <img 
                                  src={entry.images[idx]!.data} 
                                  alt={`Step ${idx + 1}`} 
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity gap-2">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      fileInputRefs.current[`${entry.id}-${idx}`]?.click();
                                    }}
                                    className="p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
                                  >
                                    <Camera size={20} className="text-white" />
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveImage(entry.id, idx);
                                    }}
                                    className="p-2 bg-rose-500/80 hover:bg-rose-600 rounded-full transition-colors"
                                  >
                                    <Trash2 size={20} className="text-white" />
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <Camera size={24} className="text-stone-400 mb-2" />
                                <span className="text-[10px] font-bold text-stone-400 uppercase">Foto {idx + 1}</span>
                              </>
                            )}
                            <input 
                              type="file"
                              accept="image/*"
                              className="hidden"
                              ref={el => { fileInputRefs.current[`${entry.id}-${idx}`] = el; }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(entry.id, idx, file);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Tanggal</label>
                          <input 
                            type="date"
                            value={entry.date || ''}
                            onChange={(e) => handleFieldChange(entry.id, 'date', e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Hari</label>
                          <select 
                            value={entry.day || ''}
                            onChange={(e) => handleFieldChange(entry.id, 'day', e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                          >
                            {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Kegiatan (Dari PPM)</label>
                        <select 
                          value={entry.selectedActivity || ''}
                          onChange={(e) => handleActivityChange(entry.id, e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                        >
                          <option value="">-- Pilih Kegiatan --</option>
                          {ppmData.pengalamanBelajar.kegiatanInti
                            .filter(k => k.hari === entry.day)
                            .map((k, kIdx) => (
                              <React.Fragment key={kIdx}>
                                {k.kegiatan.map((act, actIdx) => (
                                  <option key={`${kIdx}-${actIdx}`} value={act}>
                                    {act}
                                  </option>
                                ))}
                              </React.Fragment>
                            ))}
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Deskripsi / Analisis</label>
                        <button
                          onClick={() => generateAiDescription(entry.id)}
                          disabled={isAiLoading === entry.id}
                          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full hover:bg-rose-100 transition-colors disabled:opacity-50"
                        >
                          {isAiLoading === entry.id ? (
                            <div className="w-3 h-3 border-2 border-rose-600/30 border-t-rose-600 rounded-full animate-spin" />
                          ) : (
                            <Sparkles size={12} />
                          )}
                          Bantu Buat dengan AI
                        </button>
                      </div>
                      <textarea 
                        value={entry.description}
                        onChange={(e) => handleDescriptionChange(entry.id, e.target.value)}
                        placeholder="Tuliskan deskripsi kegiatan atau analisis perkembangan anak di sini..."
                        className="w-full h-[100px] p-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all text-sm resize-none"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={handleAddEntry}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-stone-300 text-stone-500 font-bold hover:bg-stone-50 hover:border-stone-400 transition-all"
              >
                <Plus size={20} />
                Tambah Baris Penilaian
              </button>
              
              <button 
                onClick={handleSaveHistory}
                disabled={isSaving}
                className="flex-[0.5] flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={20} />
                )}
                Simpan Riwayat
              </button>

              <button 
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="flex-[0.5] flex items-center justify-center gap-2 py-4 rounded-2xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Download size={20} />
                )}
                Unduh PDF
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex gap-4">
          <div className="bg-blue-100 w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen size={20} className="text-blue-600" />
          </div>
          <div>
            <h4 className="font-bold text-blue-900 mb-1 text-sm">Tentang Foto Berseri</h4>
            <p className="text-blue-800/70 text-xs leading-relaxed">
              Foto berseri digunakan untuk mendokumentasikan proses kegiatan anak secara berurutan. 
              Setiap baris mewakili satu rangkaian kegiatan (3 foto) yang dilengkapi dengan analisis 
              atau deskripsi perkembangan yang teramati selama proses tersebut berlangsung.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
