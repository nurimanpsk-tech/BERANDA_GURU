import React, { useState, useEffect } from 'react';
import { ArrowLeft, Database, FileSpreadsheet, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { CurriculumEntry } from '../../types';
import { getSupabase } from '../../services/supabaseClient';

interface CurriculumViewerProps {
  onBack: () => void;
}

export default function CurriculumViewer({ onBack }: CurriculumViewerProps) {
  const [entries, setEntries] = useState<CurriculumEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabase();

  useEffect(() => {
    const loadCurriculum = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        // Fetch all curriculum entries since the user mentioned it's set for everyone to see
        const { data, error } = await supabase
          .from('curriculum_entries')
          .select('*');

        if (error) throw error;

        if (data && data.length > 0) {
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
  }, [supabase]);

  const sortCurriculumEntries = (data: CurriculumEntry[]) => {
    const getSubElemenRank = (subElemen: string) => {
      const upper = subElemen.toUpperCase();
      if (upper.startsWith('NAB')) return 1;
      if (upper.startsWith('JD')) return 2;
      if (upper.startsWith('DLS')) return 3;
      if (upper.startsWith('BJ')) return 4;
      return 99;
    };

    const compareTPCodes = (a: string, b: string) => {
      const aMatch = a.match(/^(\d+(\.\d+)*)/);
      const bMatch = b.match(/^(\d+(\.\d+)*)/);
      const aCode = aMatch ? aMatch[1] : '';
      const bCode = bMatch ? bMatch[1] : '';
      
      if (!aCode && !bCode) return 0;
      if (!aCode) return 1;
      if (!bCode) return -1;

      const aParts = aCode.split('.').map(Number);
      const bParts = bCode.split('.').map(Number);
      
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aVal = aParts[i] || 0;
        const bVal = bParts[i] || 0;
        if (aVal !== bVal) return aVal - bVal;
      }
      return 0;
    };

    return [...data].sort((a, b) => {
      const rankA = getSubElemenRank(a.subElemen);
      const rankB = getSubElemenRank(b.subElemen);
      if (rankA !== rankB) return rankA - rankB;
      return compareTPCodes(a.tp, b.tp);
    });
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
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold uppercase tracking-wider mb-4">
            <Database size={14} />
            Database Capaian Pembelajaran
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-light mb-4 tracking-tight">
            Database <span className="text-purple-600 italic">CP</span>
          </h1>
          <p className="text-stone-500 max-w-xl mx-auto">
            Lihat daftar Capaian Pembelajaran (CP), Tujuan Pembelajaran (TP), dan Indikator yang telah diatur oleh Admin.
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center">
            {error}
          </div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl shadow-stone-200/50 overflow-hidden border border-stone-100"
        >
          {loading ? (
            <div className="p-20 text-center">
              <Loader2 className="animate-spin mx-auto text-purple-600 mb-4" size={48} />
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
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                        <td className="p-4 text-sm text-stone-700 whitespace-pre-wrap">{entry.elemen}</td>
                        <td className="p-4 text-sm text-stone-700 whitespace-pre-wrap">{entry.subElemen}</td>
                        <td className="p-4 text-sm text-stone-700 whitespace-pre-wrap">{entry.tp}</td>
                        <td className="p-4 text-sm text-stone-700 whitespace-pre-wrap">{entry.atp}</td>
                        <td className="p-4 text-sm text-stone-700 whitespace-pre-wrap">{entry.indikator}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {entries.length === 0 && !loading && (
                <div className="p-12 text-center">
                  <FileSpreadsheet size={48} className="mx-auto text-stone-200 mb-4" />
                  <p className="text-stone-400">Belum ada data kurikulum yang tersedia.</p>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
