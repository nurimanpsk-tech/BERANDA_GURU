import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, GraduationCap, School, User, UserCheck, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getSupabase } from '../../services/supabaseClient';
import { User as AuthUser } from '@supabase/supabase-js';
import SuccessToast from '../ui/SuccessToast';

interface ClassData {
  id?: string;
  group_name: string;
  school_name: string;
  teacher_name: string;
  principal_name: string;
}

interface ClassManagerProps {
  onBack: () => void;
  user: AuthUser | null;
}

export default function ClassManager({ onBack, user }: ClassManagerProps) {
  const [classes, setClasses] = useState<ClassData[]>([
    { group_name: 'Kelompok A', school_name: '', teacher_name: '', principal_name: '' },
    { group_name: 'Kelompok B', school_name: '', teacher_name: '', principal_name: '' }
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const supabase = getSupabase();

  useEffect(() => {
    fetchClasses();
  }, [user]);

  const fetchClasses = async () => {
    if (!user || !supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('school_classes')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        const updatedClasses = [...classes];
        data.forEach((item: any) => {
          const index = updatedClasses.findIndex(c => c.group_name === item.group_name);
          if (index !== -1) {
            updatedClasses[index] = {
              id: item.id,
              group_name: item.group_name,
              school_name: item.school_name || '',
              teacher_name: item.teacher_name || '',
              principal_name: item.principal_name || ''
            };
          }
        });
        setClasses(updatedClasses);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (groupName: string) => {
    if (!user || !supabase) return;
    
    const classToSave = classes.find(c => c.group_name === groupName);
    if (!classToSave) return;

    setSaving(groupName);
    try {
      const payload = {
        user_id: user.id,
        group_name: classToSave.group_name,
        school_name: classToSave.school_name,
        teacher_name: classToSave.teacher_name,
        principal_name: classToSave.principal_name,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('school_classes')
        .upsert(payload, { onConflict: 'user_id,group_name' });

      if (error) throw error;
      setToastMessage(`Data ${groupName} berhasil disimpan!`);
      setShowToast(true);
      setActiveGroup(null);
      fetchClasses();
    } catch (error) {
      console.error('Error saving class:', error);
      alert('Gagal menyimpan data.');
    } finally {
      setSaving(null);
    }
  };

  const updateClassField = (groupName: string, field: keyof ClassData, value: string) => {
    setClasses(prev => prev.map(c => 
      c.group_name === groupName ? { ...c, [field]: value } : c
    ));
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center relative">
          <button 
            onClick={onBack}
            className="absolute left-0 top-0 p-2 rounded-full hover:bg-stone-200 transition-colors"
            title="Kembali"
          >
            <ArrowLeft size={24} className="text-stone-600" />
          </button>
          <h1 className="text-4xl font-serif mb-4">Data <span className="text-indigo-600 italic">Kelas</span></h1>
          <p className="text-stone-500">Kelola identitas sekolah, guru, dan kepala sekolah untuk setiap kelompok.</p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
            <p className="text-stone-500 font-medium tracking-widest uppercase text-xs">Memuat Data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {classes.map((cls) => (
              <motion.div
                key={cls.group_name}
                layout
                className="bg-white rounded-[2.5rem] shadow-xl border border-stone-100 overflow-hidden flex flex-col"
              >
                <div className={`p-8 ${cls.group_name === 'Kelompok A' ? 'bg-indigo-50' : 'bg-emerald-50'} border-b border-stone-100 flex items-center justify-between`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${cls.group_name === 'Kelompok A' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}`}>
                      <GraduationCap size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-stone-800">{cls.group_name}</h3>
                      <p className="text-xs text-stone-500 font-medium uppercase tracking-widest">
                        {cls.group_name === 'Kelompok A' ? 'Usia 4-5 Tahun' : 'Usia 5-6 Tahun'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-6 flex-1">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
                      <School size={14} /> Nama TK / Sekolah
                    </label>
                    <input 
                      type="text"
                      value={cls.school_name}
                      onChange={(e) => updateClassField(cls.group_name, 'school_name', e.target.value)}
                      placeholder="Ketik Nama Sekolah"
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-stone-800 font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
                      <User size={14} /> Nama Guru
                    </label>
                    <input 
                      type="text"
                      value={cls.teacher_name}
                      onChange={(e) => updateClassField(cls.group_name, 'teacher_name', e.target.value)}
                      placeholder="Ketik Nama Guru"
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-stone-800 font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
                      <UserCheck size={14} /> Nama Kepala Sekolah
                    </label>
                    <input 
                      type="text"
                      value={cls.principal_name}
                      onChange={(e) => updateClassField(cls.group_name, 'principal_name', e.target.value)}
                      placeholder="Ketik Nama Kepala Sekolah"
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-stone-800 font-medium"
                    />
                  </div>
                </div>

                <div className="p-8 pt-0">
                  <button
                    onClick={() => handleSave(cls.group_name)}
                    disabled={saving === cls.group_name}
                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 ${
                      cls.group_name === 'Kelompok A' 
                        ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' 
                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                    }`}
                  >
                    {saving === cls.group_name ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Save size={20} />
                    )}
                    Simpan Data {cls.group_name}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 p-8 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
          <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
            <UserCheck size={20} />
          </div>
          <div>
            <h4 className="font-bold text-amber-900 mb-1 text-sm">Informasi Penting</h4>
            <p className="text-amber-800/70 text-xs leading-relaxed">
              Data yang Anda simpan di sini akan digunakan secara otomatis sebagai identitas pada setiap dokumen PPM dan Asesmen yang Anda buat. Pastikan data sudah benar untuk menghindari kesalahan pada laporan PDF.
            </p>
          </div>
        </div>
      </div>
      
      <SuccessToast 
        show={showToast} 
        message={toastMessage} 
        onClose={() => setShowToast(false)} 
      />
    </div>
  );
}
