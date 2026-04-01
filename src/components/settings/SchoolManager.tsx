import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, School, MapPin, Hash, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getSupabase } from '../../services/supabaseClient';
import { User as AuthUser } from '@supabase/supabase-js';
import SuccessToast from '../ui/SuccessToast';

interface SchoolData {
  school_name: string;
  npsn: string;
  address: string;
  phone: string;
  email: string;
}

interface SchoolManagerProps {
  onBack: () => void;
  user: AuthUser | null;
}

export default function SchoolManager({ onBack, user }: SchoolManagerProps) {
  const [data, setData] = useState<SchoolData>({
    school_name: '',
    npsn: '',
    address: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const supabase = getSupabase();

  useEffect(() => {
    fetchSchoolData();
  }, [user]);

  const fetchSchoolData = async () => {
    if (!user || !supabase) return;
    setLoading(true);
    try {
      const { data: existingData, error } = await supabase
        .from('profiles')
        .select('school_name, npsn, address, phone, email')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (existingData) {
        setData({
          school_name: existingData.school_name || '',
          npsn: existingData.npsn || '',
          address: existingData.address || '',
          phone: existingData.phone || '',
          email: existingData.email || ''
        });
      }
    } catch (error) {
      console.error('Error fetching school data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !supabase) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          school_name: data.school_name,
          npsn: data.npsn,
          address: data.address,
          phone: data.phone,
          email: data.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      setShowToast(true);
    } catch (error) {
      console.error('Error saving school data:', error);
      alert('Gagal menyimpan data sekolah.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 text-center relative">
          <button 
            onClick={onBack}
            className="absolute left-0 top-0 p-2 rounded-full hover:bg-stone-200 transition-colors"
            title="Kembali"
          >
            <ArrowLeft size={24} className="text-stone-600" />
          </button>
          <h1 className="text-4xl font-serif mb-4">Data <span className="text-amber-600 italic">Sekolah</span></h1>
          <p className="text-stone-500">Kelola identitas umum sekolah Anda.</p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-amber-600" size={48} />
            <p className="text-stone-500 font-medium tracking-widest uppercase text-xs">Memuat Data...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] shadow-xl border border-stone-100 overflow-hidden"
          >
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
                    <School size={14} /> Nama TK / Sekolah
                  </label>
                  <input 
                    type="text"
                    value={data.school_name}
                    onChange={(e) => setData({ ...data, school_name: e.target.value })}
                    placeholder="Contoh: TK Balegondo 1"
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-stone-800 font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
                    <Hash size={14} /> NPSN
                  </label>
                  <input 
                    type="text"
                    value={data.npsn}
                    onChange={(e) => setData({ ...data, npsn: e.target.value })}
                    placeholder="Masukkan NPSN"
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-stone-800 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
                  <MapPin size={14} /> Alamat Lengkap
                </label>
                <textarea 
                  value={data.address}
                  onChange={(e) => setData({ ...data, address: e.target.value })}
                  placeholder="Masukkan alamat lengkap sekolah"
                  rows={3}
                  className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-stone-800 font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
                    <Phone size={14} /> Nomor Telepon
                  </label>
                  <input 
                    type="text"
                    value={data.phone}
                    onChange={(e) => setData({ ...data, phone: e.target.value })}
                    placeholder="Contoh: 08123456789"
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-stone-800 font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
                    <Mail size={14} /> Email Sekolah
                  </label>
                  <input 
                    type="email"
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    placeholder="Contoh: sekolah@gmail.com"
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-stone-800 font-medium"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold shadow-lg shadow-amber-200 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Save size={20} />
                  )}
                  Simpan Data Sekolah
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      <SuccessToast 
        show={showToast} 
        message="Data Sekolah berhasil diperbarui!" 
        onClose={() => setShowToast(false)} 
      />
    </div>
  );
}
