import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Save, Database, FileSpreadsheet } from 'lucide-react';
import { motion } from 'motion/react';
import { CurriculumEntry } from '../types';

interface CurriculumManagerProps {
  onBack: () => void;
}

export default function CurriculumManager({ onBack }: CurriculumManagerProps) {
  const [entries, setEntries] = useState<CurriculumEntry[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('bank_kurikulum');
    if (saved) {
      setEntries(JSON.parse(saved));
    } else {
      // Default example entry from user's image
      const defaultEntry: CurriculumEntry = {
        id: 'example-1',
        elemen: 'Nilai Agama dan Budi Pekerti',
        subElemen: 'NAB 1. Murid percaya kepada Tuhan Yang Maha Esa sebagai pencipta dirinya, makhluk lain dan alam, serta mulai mengenal dan mempraktikkan ajaran pokok sesuai dengan agama dan kepercayaannya',
        tp: '1.1.1 Murid mengenal ciptaan Tuhan dan agama yang dianut',
        atp: 'o Murid menyebutkan contoh ciptaan Tuhan\no Mengenal kata kata pujian / Syukur kepada Tuhannya\no Mengenali benda, hewan, tumbuhan ciptaan Tuhan.',
        indikator: 'o Menyebutkan ciptaan Tuhan semesta alam.\no Membiasakan bersyukur\no Mengelompokkan ciptaan Tuhan dan buatan manusia.'
      };
      setEntries([defaultEntry]);
      // Save it immediately so AI can read it
      localStorage.setItem('bank_kurikulum', JSON.stringify([defaultEntry]));
    }
  }, []);

  const handleAddRow = () => {
    const newEntry: CurriculumEntry = {
      id: Date.now().toString(),
      elemen: '',
      subElemen: '',
      tp: '',
      atp: '',
      indikator: ''
    };
    setEntries([...entries, newEntry]);
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

  const handleSave = () => {
    localStorage.setItem('bank_kurikulum', JSON.stringify(entries));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
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
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-semibold uppercase tracking-wider mb-4">
            <Database size={14} />
            Manajemen Data Kurikulum
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-light mb-4 tracking-tight">
            Bank <span className="text-indigo-600 italic">Kurikulum</span>
          </h1>
          <p className="text-stone-500 max-w-xl mx-auto">
            Input daftar TP dan IKTP dari Pengawas di sini. AI akan menggunakan data ini sebagai referensi utama saat membuat perencanaan.
          </p>
        </header>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleAddRow}
            className="flex items-center gap-2 bg-white border border-stone-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Tambah Baris
          </button>
          
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium transition-all shadow-md ${
              isSaved ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            <Save size={18} />
            {isSaved ? 'Tersimpan!' : 'Simpan Perubahan'}
          </button>
        </div>

        {/* Table Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl shadow-stone-200/50 overflow-hidden border border-stone-100"
        >
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
                        className="w-full bg-transparent border-none focus:ring-2 focus:ring-indigo-500/20 rounded-lg p-2 text-sm resize-none min-h-[80px]"
                      />
                    </td>
                    <td className="p-2">
                      <textarea
                        value={entry.subElemen}
                        onChange={(e) => handleChange(entry.id, 'subElemen', e.target.value)}
                        placeholder="Contoh: NAB 1..."
                        className="w-full bg-transparent border-none focus:ring-2 focus:ring-indigo-500/20 rounded-lg p-2 text-sm resize-none min-h-[80px]"
                      />
                    </td>
                    <td className="p-2">
                      <textarea
                        value={entry.tp}
                        onChange={(e) => handleChange(entry.id, 'tp', e.target.value)}
                        placeholder="Isi TP..."
                        className="w-full bg-transparent border-none focus:ring-2 focus:ring-indigo-500/20 rounded-lg p-2 text-sm resize-none min-h-[80px]"
                      />
                    </td>
                    <td className="p-2">
                      <textarea
                        value={entry.atp}
                        onChange={(e) => handleChange(entry.id, 'atp', e.target.value)}
                        placeholder="Isi ATP..."
                        className="w-full bg-transparent border-none focus:ring-2 focus:ring-indigo-500/20 rounded-lg p-2 text-sm resize-none min-h-[80px]"
                      />
                    </td>
                    <td className="p-2">
                      <textarea
                        value={entry.indikator}
                        onChange={(e) => handleChange(entry.id, 'indikator', e.target.value)}
                        placeholder="Isi Indikator..."
                        className="w-full bg-transparent border-none focus:ring-2 focus:ring-indigo-500/20 rounded-lg p-2 text-sm resize-none min-h-[80px]"
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
          
          {entries.length === 0 && (
            <div className="p-12 text-center">
              <FileSpreadsheet size={48} className="mx-auto text-stone-200 mb-4" />
              <p className="text-stone-400">Belum ada data. Klik "Tambah Baris" untuk mulai menginput.</p>
            </div>
          )}
        </motion.div>

        <footer className="mt-12 text-center text-stone-400 text-xs font-medium uppercase tracking-widest">
          &copy; 2026 Curriculum Manager • Data tersimpan di browser Anda
        </footer>
      </div>
    </div>
  );
}
