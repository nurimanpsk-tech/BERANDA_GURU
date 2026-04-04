import React, { useState, useEffect } from 'react';
import { ArrowLeft, Database, Loader2, Search, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { CurriculumEntry } from '../../../types';
import { getSupabase } from '../../../services/supabaseClient';

interface CurriculumViewerProps {
  onBack: () => void;
}

export default function CurriculumViewer({ onBack }: CurriculumViewerProps) {
  const [entries, setEntries] = useState<CurriculumEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

  useEffect(() => {
    const loadCurriculum = async () => {
      if (!supabase) return;

      try {
        const { data, error } = await supabase
          .from('curriculum_entries')
          .select('*');

        if (error) throw error;

        if (data) {
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
        }
      } catch (err: any) {
        console.error('Error loading curriculum:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCurriculum();
  }, [supabase]);

  const filteredEntries = entries.filter(e => 
    e.elemen.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.subElemen.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.tp.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.indikator.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12 text-center relative">
          <button 
            onClick={onBack}
            className="absolute left-0 top-0 p-2 rounded-full hover:bg-stone-200 transition-colors"
            title="Kembali"
          >
            <ArrowLeft size={24} className="text-stone-600" />
          </button>
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold uppercase tracking-wider mb-4">
            <BookOpen size={14} />
            Database Capaian Pembelajaran
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-light mb-4 tracking-tight">
            Referensi <span className="text-blue-600 italic">Kurikulum</span>
          </h1>
          <p className="text-stone-500 max-w-xl mx-auto">
            Daftar lengkap Elemen, TP, dan IKTP sebagai panduan penyusunan administrasi guru.
          </p>
        </header>

        {/* Search Bar */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input
              type="text"
              placeholder="Cari elemen, TP, atau indikator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Table Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl shadow-stone-200/50 overflow-hidden border border-stone-100"
        >
          {loading ? (
            <div className="p-20 text-center">
              <Loader2 className="animate-spin mx-auto text-blue-600 mb-4" size={48} />
              <p className="text-stone-500">Memuat data kurikulum...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100">
                    <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-stone-400 w-48">Elemen</th>
                    <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-stone-400 w-48">Sub-Elemen</th>
                    <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-stone-400 w-80">Tujuan Pembelajaran (TP)</th>
                    <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-stone-400">Indikator (IKTP)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-stone-50 hover:bg-blue-50/30 transition-colors">
                      <td className="p-5 text-sm font-medium text-stone-800 align-top">{entry.elemen}</td>
                      <td className="p-5 text-sm text-stone-600 align-top">{entry.subElemen}</td>
                      <td className="p-5 text-sm text-stone-600 leading-relaxed align-top">
                        <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/50 whitespace-pre-wrap">
                          {entry.tp}
                        </div>
                      </td>
                      <td className="p-5 text-sm text-stone-600 leading-relaxed align-top">
                        <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50 whitespace-pre-wrap">
                          {entry.indikator}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredEntries.length === 0 && (
                <div className="p-20 text-center text-stone-400">
                  Data tidak ditemukan.
                </div>
              )}
            </div>
          )}
        </motion.div>

        <footer className="mt-12 text-center text-stone-400 text-xs font-medium uppercase tracking-widest">
          &copy; 2026 Curriculum Database • Referensi Guru PAUD/TK
        </footer>
      </div>
    </div>
  );
}
