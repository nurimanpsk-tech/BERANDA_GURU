import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Save, Database, FileSpreadsheet, Loader2, Sparkles, X, Download, Edit2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CurriculumEntry } from '../../../types';
import { getSupabase } from '../../../services/supabaseClient';
import { User } from '@supabase/supabase-js';
import { generateJSON } from '../../../services/aiService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface CurriculumManagerProps {
  onBack: () => void;
  user: User | null;
}

export default function CurriculumManager({ onBack, user }: CurriculumManagerProps) {
  const [entries, setEntries] = useState<CurriculumEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const [curriculumTitle, setCurriculumTitle] = useState('CAPAIAN PEMBELAJARAN DAN TUJUAN PEMBELAJARAN\nTAHUN PELAJARAN 2025/2026');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  const supabase = getSupabase();

  const sortCurriculumEntries = (entries: CurriculumEntry[]) => {
    const categoryOrder = ['NAB', 'JD', 'DLS', 'BJW'];
    
    return [...entries].sort((a, b) => {
      // 1. Sort by category
      const getCategoryIndex = (entry: CurriculumEntry) => {
        const text = (entry.elemen + ' ' + entry.subElemen).toUpperCase();
        for (let i = 0; i < categoryOrder.length; i++) {
          if (text.includes(categoryOrder[i])) return i;
        }
        return 99; // Default for others
      };

      const catA = getCategoryIndex(a);
      const catB = getCategoryIndex(b);

      if (catA !== catB) return catA - catB;

      // 2. Sort by TP code (numeric parts)
      const getTPCode = (entry: CurriculumEntry) => {
        // Look for pattern like 1.1.1 in TP
        const match = entry.tp.match(/(\d+\.?\d*\.?\d*)/);
        return match ? match[1] : '';
      };

      const codeA = getTPCode(a);
      const codeB = getTPCode(b);

      if (codeA && codeB) {
        const partsA = codeA.split('.').map(v => parseInt(v) || 0);
        const partsB = codeB.split('.').map(v => parseInt(v) || 0);
        
        for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
          const valA = partsA[i] || 0;
          const valB = partsB[i] || 0;
          if (valA !== valB) return valA - valB;
        }
      }

      return codeA.localeCompare(codeB);
    });
  };

  // Load from Supabase on mount
  useEffect(() => {
    const loadCurriculum = async () => {
      if (!supabase || !user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('curriculum_entries')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        if (data && data.length > 0) {
          // Map snake_case from DB to camelCase for UI
          const mappedData = data.map(item => ({
            id: item.id,
            user_id: item.user_id,
            elemen: item.elemen,
            subElemen: item.sub_elemen,
            tp: item.tp,
            atp: item.atp,
            indikator: item.indikator
          }));
          setEntries(sortCurriculumEntries(mappedData));
        } else {
          // Start empty if no data in DB
          setEntries([]);
        }
      } catch (err: any) {
        console.error('Error loading curriculum:', err);
        setError('Gagal memuat data kurikulum.');
      } finally {
        setLoading(false);
      }
    };

    loadCurriculum();
  }, [supabase, user]);

  const handleAddRow = () => {
    const newEntry: CurriculumEntry = {
      id: 'temp-' + Date.now(),
      elemen: '',
      subElemen: '',
      tp: '',
      atp: '',
      indikator: ''
    };
    // Add to top as requested
    setEntries([newEntry, ...entries]);
    setIsSaved(false);
  };

  const handleRemoveRow = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
    setIsSaved(false);
  };

  const handleChange = (id: string, field: keyof CurriculumEntry, value: string) => {
    setEntries(entries.map(e => e.id === id ? { ...e, [field]: value } : e));
    setIsSaved(false);
  };

  const handleSave = async () => {
    if (!supabase || !user) return;

    setSaving(true);
    setError(null);

    try {
      // Prepare data for Supabase (snake_case)
      const dataToSave = entries.map(entry => ({
        user_id: user.id,
        elemen: entry.elemen,
        sub_elemen: entry.subElemen,
        tp: entry.tp,
        atp: entry.atp,
        indikator: entry.indikator
      }));

      // In a real app, we might want to delete old entries and insert new ones
      // or perform an upsert if we had stable IDs. 
      // For simplicity here, we'll clear and re-insert.
      
      const { error: deleteError } = await supabase
        .from('curriculum_entries')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('curriculum_entries')
        .insert(dataToSave);

      if (insertError) throw insertError;

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      
      // Reload to get real IDs from DB
      const { data: newData } = await supabase
        .from('curriculum_entries')
        .select('*')
        .eq('user_id', user.id);
      
      if (newData) {
        const mappedData = newData.map(item => ({
          id: item.id,
          user_id: item.user_id,
          elemen: item.elemen,
          subElemen: item.sub_elemen,
          tp: item.tp,
          atp: item.atp,
          indikator: item.indikator
        }));
        setEntries(sortCurriculumEntries(mappedData));
      }

    } catch (err: any) {
      console.error('Error saving curriculum:', err);
      setError('Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  };

  const handleAIImport = async () => {
    if (!importText.trim()) return;
    setImporting(true);
    setError(null);

    try {
      const prompt = `
        Tugas Anda adalah mengekstrak data kurikulum dari teks mentah berikut.
        Teks ini berasal dari dokumen Capaian Pembelajaran (CP) PAUD/TK.
        
        Ekstrak informasi berikut untuk setiap baris:
        1. Elemen (Contoh: Nilai Agama dan Budi Pekerti, Jati Diri, Dasar-dasar Literasi, Matematika, Sains, Teknologi, Rekayasa, dan Seni)
        2. Sub-Elemen (Jika ada, jika tidak kosongkan)
        3. TP (Tujuan Pembelajaran)
        4. ATP (Alur Tujuan Pembelajaran - Jika ada, jika tidak kosongkan)
        5. Indikator (IKTP - Indikator Ketercapaian Tujuan Pembelajaran)

        Teks Mentah:
        ${importText}

        Format Output JSON (WAJIB berupa objek dengan key "kurikulum"):
        {
          "kurikulum": [
            {
              "elemen": "...",
              "subElemen": "...",
              "tp": "...",
              "atp": "...",
              "indikator": "..."
            }
          ]
        }
        
        PENTING: Berikan data yang lengkap dan akurat sesuai teks. Jika teks sangat panjang, ambil poin-poin utamanya.
      `;

      const result = await generateJSON(prompt);
      
      let dataArray = [];
      if (Array.isArray(result)) {
        dataArray = result;
      } else if (result && typeof result === 'object' && Array.isArray(result.kurikulum)) {
        dataArray = result.kurikulum;
      } else if (result && typeof result === 'object' && Array.isArray(result.data)) {
        dataArray = result.data;
      } else if (result && typeof result === 'object') {
        // Try to find any array in the object
        const firstArrayKey = Object.keys(result).find(key => Array.isArray(result[key]));
        if (firstArrayKey) {
          dataArray = result[firstArrayKey];
        }
      }

      if (dataArray.length > 0) {
        const newEntries: CurriculumEntry[] = dataArray.map((item: any, index: number) => ({
          id: 'ai-' + Date.now() + '-' + index,
          elemen: item.elemen || '',
          subElemen: item.subElemen || '',
          tp: item.tp || '',
          atp: item.atp || '',
          indikator: item.indikator || ''
        }));
        
        setEntries([...entries, ...newEntries]);
        setShowImportModal(false);
        setImportText('');
      } else {
        throw new Error("Format data AI tidak valid atau tidak ditemukan data kurikulum.");
      }
    } catch (err) {
      console.error('Error importing via AI:', err);
      setError('Gagal memproses teks. Pastikan teks yang ditempel cukup jelas.');
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    
    // Add Title
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    
    // Split title by newline if exists, or handle the specific split requested
    let titleToPrint = curriculumTitle.toUpperCase();
    if (!titleToPrint.includes('\n') && titleToPrint.includes('TAHUN PELAJARAN')) {
      titleToPrint = titleToPrint.replace('TAHUN PELAJARAN', '\nTAHUN PELAJARAN');
    }
    
    const titleLines = doc.splitTextToSize(titleToPrint, 270);
    doc.text(titleLines, 148.5, 15, { align: 'center' });
    
    // Add Table
    const cleanText = (text: string) => {
      if (!text) return '';
      return text
        // Ensure space after number + dot (e.g., "1.Kalimat" -> "1. Kalimat")
        .replace(/(\d+\.)([^\s\d])/g, '$1 $2')
        // Replace multiple horizontal spaces with a single space
        .replace(/[ \t]+/g, ' ')
        .trim();
    };

    const tableData = entries.map(entry => [
      cleanText(entry.elemen),
      cleanText(entry.subElemen),
      cleanText(entry.tp),
      cleanText(entry.atp),
      cleanText(entry.indikator)
    ]);

    autoTable(doc, {
      startY: 20 + (titleLines.length * 7),
      head: [['ELEMEN', 'SUB-ELEMEN', 'TUJUAN PEMBELAJARAN (TP)', 'ATP', 'INDIKATOR (IKTP)']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [218, 233, 247], // #DAE9F7 (Light Blue)
        textColor: [0, 0, 0], // Black text
        fontSize: 9,
        font: 'times',
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        lineColor: [0, 0, 0], // Black for borders
        lineWidth: 0.3
      },
      styles: {
        font: 'times',
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        textColor: [26, 26, 26],
        lineColor: [0, 0, 0], // Black for all borders
        lineWidth: 0.3
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 45 },
        2: { cellWidth: 60 },
        3: { cellWidth: 60 },
        4: { cellWidth: 'auto' }
      }
    });

    doc.save(`Kurikulum_${new Date().getFullYear()}.pdf`);
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
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-4">
            <Database size={14} />
            Manajemen Data Kurikulum
          </div>
          
          <div className="max-w-3xl mx-auto mb-4 group relative">
            {isEditingTitle ? (
              <div className="flex items-center justify-center gap-2">
                <textarea
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="text-2xl md:text-3xl font-serif font-bold text-center bg-white border-b-2 border-amber-500 outline-none px-4 py-1 w-full resize-none"
                  rows={2}
                  autoFocus
                />
                <button 
                  onClick={() => {
                    setCurriculumTitle(tempTitle);
                    setIsEditingTitle(false);
                  }}
                  className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                >
                  <Check size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-stone-800 whitespace-pre-line">
                  {curriculumTitle}
                </h1>
                <button 
                  onClick={() => {
                    setTempTitle(curriculumTitle);
                    setIsEditingTitle(true);
                  }}
                  className="p-2 text-stone-400 hover:text-amber-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Edit2 size={18} />
                </button>
              </div>
            )}
          </div>

          <h2 className="text-4xl md:text-5xl font-serif font-light mb-4 tracking-tight">
            Kelola <span className="text-amber-600 italic">Capaian Pembelajaran</span>
          </h2>
          <p className="text-stone-500 max-w-xl mx-auto">
            Input daftar TP dan IKTP dari Pengawas di sini. Data ini akan tersimpan aman di database dan menjadi referensi utama AI.
          </p>
        </header>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleAddRow}
              className="flex items-center gap-2 bg-white border border-stone-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors shadow-sm"
            >
              <Plus size={18} />
              Tambah Baris
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors shadow-sm"
            >
              <Sparkles size={18} />
              Impor via AI
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={entries.length === 0}
              className="flex items-center gap-2 bg-stone-800 border border-stone-700 px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-stone-900 transition-colors shadow-sm disabled:opacity-50"
            >
              <Download size={18} />
              Download PDF
            </button>
            {error && <span className="text-red-500 text-sm font-medium">{error}</span>}
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium transition-all shadow-md disabled:opacity-50 ${
              isSaved ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white hover:bg-amber-700'
            }`}
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {isSaved ? 'Tersimpan!' : saving ? 'Menyimpan...' : 'Simpan ke Database'}
          </button>
        </div>

        {/* Table Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl shadow-stone-200/50 overflow-hidden border border-stone-100"
        >
          {loading ? (
            <div className="p-20 text-center">
              <Loader2 className="animate-spin mx-auto text-amber-600 mb-4" size={48} />
              <p className="text-stone-500">Memuat data dari database...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-100">
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400 w-48">Elemen</th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400 w-48">Sub-Elemen</th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400 w-64">Tujuan Pembelajaran (TP)</th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400 w-64">ATP</th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Indikator (IKTP)</th>
                      <th className="p-4 w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, index) => (
                      <tr key={entry.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                        <td className="p-2">
                          <textarea
                            value={entry.elemen}
                            onChange={(e) => handleChange(entry.id, 'elemen', e.target.value)}
                            placeholder="Contoh: Nilai Agama..."
                            className="w-full bg-transparent border-none focus:ring-2 focus:ring-amber-500/20 rounded-lg p-2 text-sm resize-none min-h-[80px]"
                          />
                        </td>
                        <td className="p-2">
                          <textarea
                            value={entry.subElemen}
                            onChange={(e) => handleChange(entry.id, 'subElemen', e.target.value)}
                            placeholder="Contoh: NAB 1..."
                            className="w-full bg-transparent border-none focus:ring-2 focus:ring-amber-500/20 rounded-lg p-2 text-sm resize-none min-h-[80px]"
                          />
                        </td>
                        <td className="p-2">
                          <textarea
                            value={entry.tp}
                            onChange={(e) => handleChange(entry.id, 'tp', e.target.value)}
                            placeholder="Isi TP..."
                            className="w-full bg-transparent border-none focus:ring-2 focus:ring-amber-500/20 rounded-lg p-2 text-sm resize-none min-h-[80px]"
                          />
                        </td>
                        <td className="p-2">
                          <textarea
                            value={entry.atp}
                            onChange={(e) => handleChange(entry.id, 'atp', e.target.value)}
                            placeholder="Isi ATP..."
                            className="w-full bg-transparent border-none focus:ring-2 focus:ring-amber-500/20 rounded-lg p-2 text-sm resize-none min-h-[80px]"
                          />
                        </td>
                        <td className="p-2">
                          <textarea
                            value={entry.indikator}
                            onChange={(e) => handleChange(entry.id, 'indikator', e.target.value)}
                            placeholder="Isi Indikator..."
                            className="w-full bg-transparent border-none focus:ring-2 focus:ring-amber-500/20 rounded-lg p-2 text-sm resize-none min-h-[80px]"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleRemoveRow(entry.id)}
                            className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                            title="Hapus Baris"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {entries.length === 0 && !loading && (
                <div className="p-12 text-center">
                  <FileSpreadsheet size={48} className="mx-auto text-stone-200 mb-4" />
                  <p className="text-stone-400">Belum ada data. Klik "Tambah Baris" untuk mulai menginput.</p>
                </div>
              )}
            </>
          )}
        </motion.div>

        <footer className="mt-12 text-center text-stone-400 text-xs font-medium uppercase tracking-widest">
          &copy; 2026 Curriculum Manager • Data tersimpan di Database Supabase
        </footer>

        {/* Import Modal */}
        <AnimatePresence>
          {showImportModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-800">Impor Data via AI</h3>
                      <p className="text-xs text-stone-500">Tempel teks dari dokumen Word Anda di bawah ini.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowImportModal(false)}
                    className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-stone-400" />
                  </button>
                </div>
                
                <div className="p-6">
                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Tempel teks Capaian Pembelajaran (CP) di sini..."
                    className="w-full h-64 bg-stone-50 border border-stone-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                  />
                  <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                    <div className="text-amber-600 mt-0.5">
                      <Database size={16} />
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      <strong>Tips:</strong> Salin teks dari kolom Elemen, TP, dan Indikator di dokumen Word Anda. AI akan mencoba memetakan data tersebut ke dalam tabel secara otomatis.
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-stone-50 border-t border-stone-100 flex justify-end gap-3">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="px-6 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleAIImport}
                    disabled={importing || !importText.trim()}
                    className="flex items-center gap-2 bg-amber-600 text-white px-8 py-2 rounded-xl text-sm font-medium hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 disabled:opacity-50"
                  >
                    {importing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    {importing ? 'Memproses...' : 'Proses dengan AI'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
