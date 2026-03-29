import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Save, Database, FileSpreadsheet, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { CurriculumEntry } from '../types';
import { getSupabase } from '../services/supabaseClient';
import { User } from '@supabase/supabase-js';

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

  const supabase = getSupabase();

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
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

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
          setEntries(mappedData);
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (newData) {
        setEntries(newData.map(item => ({
          id: item.id,
          user_id: item.user_id,
          elemen: item.elemen,
          subElemen: item.sub_elemen,
          tp: item.tp,
          atp: item.atp,
          indikator: item.indikator
        })));
      }

    } catch (err: any) {
      console.error('Error saving curriculum:', err);
      setError('Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
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
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-semibold uppercase tracking-wider mb-4">
            <Database size={14} />
            Manajemen Data Kurikulum
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-light mb-4 tracking-tight">
            Kelola <span className="text-indigo-600 italic">Capaian Pembelajaran</span>
          </h1>
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
            {error && <span className="text-red-500 text-sm font-medium">{error}</span>}
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium transition-all shadow-md disabled:opacity-50 ${
              isSaved ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
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
              <Loader2 className="animate-spin mx-auto text-indigo-600 mb-4" size={48} />
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
      </div>
    </div>
  );
}
