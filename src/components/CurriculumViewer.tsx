import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, BookOpen, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { getSupabase } from '../services/supabaseClient';
import { CurriculumEntry } from '../types';

interface CurriculumViewerProps {
  onBack: () => void;
}

export default function CurriculumViewer({ onBack }: CurriculumViewerProps) {
  const [entries, setEntries] = useState<CurriculumEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElemen, setSelectedElemen] = useState<string>('Semua');

  useEffect(() => {
    fetchCurriculum();
  }, []);

  const fetchCurriculum = async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('curriculum_entries')
        .select('*')
        .order('elemen', { ascending: true });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching curriculum:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = 
      entry.tp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.elemen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.subElemen.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesElemen = selectedElemen === 'Semua' || entry.elemen === selectedElemen;
    
    return matchesSearch && matchesElemen;
  });

  const elemenOptions = ['Semua', ...new Set(entries.map(e => e.elemen))];

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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-6">
            <BookOpen className="text-emerald-600" size={32} />
          </div>
          <h1 className="text-4xl font-serif mb-4">Database Kurikulum</h1>
          <p className="text-stone-500 max-w-2xl mx-auto">
            Daftar Tujuan Pembelajaran (TP) yang telah ditentukan oleh Admin Sekolah.
          </p>
        </header>

        <div className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden">
          {/* Filters */}
          <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="text"
                placeholder="Cari TP atau Elemen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="relative min-w-[200px]">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <select
                value={selectedElemen}
                onChange={(e) => setSelectedElemen(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
              >
                {elemenOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-widest">
                  <th className="px-6 py-4 border-b border-stone-100">Elemen & Sub-Elemen</th>
                  <th className="px-6 py-4 border-b border-stone-100">Tujuan Pembelajaran (TP)</th>
                  <th className="px-6 py-4 border-b border-stone-100">Indikator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-stone-400">
                      Memuat data kurikulum...
                    </td>
                  </tr>
                ) : filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-stone-400">
                      Tidak ada data yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 w-fit">
                            {entry.elemen}
                          </span>
                          <span className="text-xs text-stone-500 font-medium">
                            {entry.subElemen}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <p className="text-sm text-stone-800 leading-relaxed">
                          {entry.tp}
                        </p>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <p className="text-xs text-stone-500 italic">
                          {entry.indikator}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-stone-50 border-t border-stone-100 text-center">
            <p className="text-[10px] text-stone-400 italic">
              * Data ini dikelola oleh Admin Sekolah. Silakan hubungi Admin jika ada perubahan kurikulum.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
