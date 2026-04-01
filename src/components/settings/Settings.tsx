import React, { useState } from 'react';
import { ArrowLeft, LogOut, User as UserIcon, Shield, Bell, HelpCircle, GraduationCap, School, Construction, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '@supabase/supabase-js';
import { appSettingsService } from '../../services/appSettingsService';

interface SettingsProps {
  onBack: () => void;
  user: User | null;
  profile?: any;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  isAdmin?: boolean;
  maintenanceMode?: boolean;
  onMaintenanceToggle?: (enabled: boolean) => void;
}

export default function Settings({ 
  onBack, 
  user, 
  profile, 
  onLogout, 
  onNavigate,
  isAdmin,
  maintenanceMode: initialMaintenanceMode,
  onMaintenanceToggle
}: SettingsProps) {
  const [isUpdatingMaintenance, setIsUpdatingMaintenance] = useState(false);

  const toggleMaintenance = async () => {
    if (!onMaintenanceToggle) return;
    
    setIsUpdatingMaintenance(true);
    try {
      const newValue = !initialMaintenanceMode;
      await appSettingsService.setMaintenanceMode(newValue);
      onMaintenanceToggle(newValue);
    } catch (err) {
      console.error('Failed to toggle maintenance mode:', err);
      alert('Gagal mengubah mode pemeliharaan. Pastikan tabel app_settings sudah tersedia di database.');
    } finally {
      setIsUpdatingMaintenance(false);
    }
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
          <h1 className="text-4xl font-serif mb-4">Pengaturan</h1>
          <p className="text-stone-500">Kelola akun dan preferensi aplikasi Anda.</p>
        </header>

        <div className="space-y-6">
          {/* User Profile Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-8 border border-stone-100"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                <UserIcon size={48} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-stone-800">{user?.user_metadata?.full_name || 'Pengguna'}</h2>
                <p className="text-stone-500">{user?.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-widest">
                    Akun Terverifikasi
                  </div>
                  {isAdmin && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-600 text-xs font-bold uppercase tracking-widest">
                      Administrator
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold hover:bg-red-100 transition-all active:scale-95"
              >
                <LogOut size={20} />
                Keluar
              </button>
            </div>
          </motion.div>

          {/* Admin Tools Section */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-amber-50 rounded-3xl p-8 border border-amber-100"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
                    <Construction size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-800">Mode Pemeliharaan</h3>
                    <p className="text-xs text-stone-500">Aktifkan untuk membatasi akses pengguna umum saat pengembangan.</p>
                  </div>
                </div>
                <button
                  onClick={toggleMaintenance}
                  disabled={isUpdatingMaintenance}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${
                    initialMaintenanceMode ? 'bg-amber-600' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      initialMaintenanceMode ? 'translate-x-7' : 'translate-x-1'
                    } flex items-center justify-center`}
                  >
                    {isUpdatingMaintenance && <Loader2 size={12} className="animate-spin text-amber-600" />}
                  </span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Settings Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => onNavigate('data-kelas')}
              className="bg-white rounded-3xl shadow-lg p-6 border border-stone-100 flex items-center gap-4 hover:shadow-xl transition-shadow cursor-pointer group"
            >
              <div className="p-3 bg-stone-100 rounded-2xl text-stone-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                <GraduationCap size={24} />
              </div>
              <div>
                <h3 className="font-bold text-stone-800">Data Kelas</h3>
                <p className="text-xs text-stone-500">Kelola Kelompok A & B (Guru & KS).</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              onClick={() => onNavigate('data-sekolah')}
              className="bg-white rounded-3xl shadow-lg p-6 border border-stone-100 flex items-center gap-4 hover:shadow-xl transition-shadow cursor-pointer group"
            >
              <div className="p-3 bg-stone-100 rounded-2xl text-stone-600 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                <School size={24} />
              </div>
              <div>
                <h3 className="font-bold text-stone-800">Data Sekolah</h3>
                <p className="text-xs text-stone-500">Identitas umum, NPSN, & Alamat.</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-lg p-6 border border-stone-100 flex items-center gap-4 hover:shadow-xl transition-shadow cursor-pointer group"
            >
              <div className="p-3 bg-stone-100 rounded-2xl text-stone-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="font-bold text-stone-800">Keamanan</h3>
                <p className="text-xs text-stone-500">Ganti kata sandi dan privasi.</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl shadow-lg p-6 border border-stone-100 flex items-center gap-4 hover:shadow-xl transition-shadow cursor-pointer group"
            >
              <div className="p-3 bg-stone-100 rounded-2xl text-stone-600 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                <HelpCircle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-stone-800">Bantuan</h3>
                <p className="text-xs text-stone-500">Pusat bantuan dan dukungan.</p>
              </div>
            </motion.div>
          </div>

          <div className="text-center pt-8">
            <p className="text-stone-400 text-xs font-medium uppercase tracking-widest">GuruPintar v1.0.0 • 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
