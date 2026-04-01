import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Calendar, 
  Shield, 
  ShieldCheck, 
  UserX, 
  UserCheck,
  ArrowLeft,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getSupabase } from '../../services/supabaseClient';
import { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email?: string;
  role: string;
  full_name?: string;
  school_name?: string;
  teacher_name?: string;
  principal_name?: string;
  group?: string;
  created_at: string;
  updated_at?: string;
  last_sign_in_at?: string;
}

interface UserManagerProps {
  onBack: () => void;
  currentUser: User | null;
}

export default function UserManager({ onBack, currentUser }: UserManagerProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const supabase = getSupabase();

  const fetchUsers = async () => {
    if (!supabase) return;
    
    setRefreshing(true);
    try {
      // Fetch from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = 
      (p.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesRole = filterRole === 'all' || p.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 rounded-full hover:bg-stone-200 transition-colors"
              title="Kembali"
            >
              <ArrowLeft size={24} className="text-stone-600" />
            </button>
            <div>
              <h1 className="text-3xl font-serif font-bold text-stone-800">Daftar <span className="italic">Pengguna</span></h1>
              <p className="text-stone-500 text-sm">Kelola dan pantau pengguna yang terdaftar di sistem.</p>
            </div>
          </div>
          
          <button 
            onClick={fetchUsers}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-stone-600 font-bold text-sm hover:bg-stone-50 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            Segarkan Data
          </button>
        </header>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-stone-100 mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="text"
              placeholder="Cari nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 bg-stone-50 px-4 py-2 rounded-2xl border border-stone-100">
            <Filter size={18} className="text-stone-400" />
            <select 
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-transparent text-sm font-bold text-stone-700 focus:outline-none"
            >
              <option value="all">Semua Peran</option>
              <option value="admin">Admin</option>
              <option value="user">Guru / User</option>
            </select>
          </div>
        </div>

        {/* User List */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-100 overflow-hidden">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 size={40} className="text-amber-600 animate-spin" />
              <p className="text-stone-500 font-medium">Memuat data pengguna...</p>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="p-20 text-center">
              <div className="bg-stone-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={32} className="text-stone-300" />
              </div>
              <h3 className="text-xl font-serif font-bold text-stone-800 mb-2">Tidak Ada Pengguna</h3>
              <p className="text-stone-400 max-w-xs mx-auto">Tidak ditemukan pengguna yang sesuai dengan kriteria pencarian Anda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50/50 border-b border-stone-100">
                    <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest">Pengguna</th>
                    <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest">Sekolah & Guru</th>
                    <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest">Peran</th>
                    <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {filteredProfiles.map((p) => (
                    <motion.tr 
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-stone-50/50 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold shadow-sm">
                            {(p.full_name || p.email || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-stone-800">{p.full_name || 'Tanpa Nama'}</p>
                            <div className="flex items-center gap-1.5 text-xs text-stone-400">
                              <Mail size={12} />
                              {p.email || 'Email tidak tersedia'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-stone-700">{p.school_name || '-'}</p>
                          <p className="text-xs text-stone-500">{p.teacher_name || '-'} ({p.group || '-'})</p>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          p.role === 'admin' 
                            ? 'bg-amber-50 text-amber-600' 
                            : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {p.role === 'admin' ? <Shield size={10} /> : <Users size={10} />}
                          {p.role}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="p-2 rounded-xl hover:bg-white hover:shadow-sm text-stone-400 hover:text-amber-600 transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <footer className="mt-12 text-center text-stone-400 text-xs font-medium uppercase tracking-widest">
          Total {filteredProfiles.length} Pengguna Terdaftar
        </footer>
      </div>
    </div>
  );
}
