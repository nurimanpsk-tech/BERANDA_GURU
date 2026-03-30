import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  UserCog, 
  Mail, 
  Phone, 
  Briefcase,
  Award,
  ChevronRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Guru {
  id: string;
  nama: string;
  nip: string;
  jabatan: string;
  email: string;
  telepon: string;
  status: 'Aktif' | 'Cuti' | 'Non-Aktif';
  foto?: string;
}

const initialGuru: Guru[] = [
  { id: '1', nama: 'Siti Aminah, S.Pd', nip: '198501012010012001', jabatan: 'Kepala Sekolah', email: 'siti.aminah@sekolah.id', telepon: '081234567890', status: 'Aktif' },
  { id: '2', nama: 'Budi Santoso, S.Pd', nip: '198702022012011002', jabatan: 'Guru Kelas A1', email: 'budi.santoso@sekolah.id', telepon: '081234567891', status: 'Aktif' },
  { id: '3', nama: 'Lani Wijaya, S.Pd', nip: '199003032015012003', jabatan: 'Guru Kelas B1', email: 'lani.wijaya@sekolah.id', telepon: '081234567892', status: 'Aktif' },
  { id: '4', nama: 'Ahmad Fauzi, S.Pd', nip: '199204042018011004', jabatan: 'Guru Kelas A2', email: 'ahmad.fauzi@sekolah.id', telepon: '081234567893', status: 'Aktif' },
];

export default function PakarData() {
  const [guru, setGuru] = useState<Guru[]>(initialGuru);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filteredGuru = guru.filter(g => 
    g.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.nip.includes(searchTerm) ||
    g.jabatan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="text"
              placeholder="Cari NIP, nama, atau jabatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all shadow-sm"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-stone-200 rounded-2xl text-stone-600 font-bold text-sm hover:bg-stone-50 transition-all shadow-sm">
            <Filter size={18} />
            Filter
          </button>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-2xl font-bold text-sm hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-200/50"
        >
          <Plus size={18} />
          Tambah Guru/Staf
        </button>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {filteredGuru.map((g, index) => (
          <motion.div
            key={g.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-[2.5rem] shadow-sm border border-stone-100 overflow-hidden group hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300"
          >
            <div className="p-8 pb-4 text-center">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 rounded-[2rem] bg-stone-100 flex items-center justify-center text-stone-400 font-bold text-2xl overflow-hidden shadow-inner mx-auto">
                  {g.foto ? <img src={g.foto} alt={g.nama} className="w-full h-full object-cover" /> : g.nama.charAt(0)}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-xl shadow-md border border-stone-50">
                  <div className={`w-4 h-4 rounded-full ${g.status === 'Aktif' ? 'bg-emerald-500' : 'bg-stone-300'}`}></div>
                </div>
              </div>
              <h3 className="text-lg font-serif font-bold text-stone-800 mb-1">{g.nama}</h3>
              <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-4">{g.jabatan}</p>
              
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-500 text-[10px] font-bold uppercase tracking-widest">
                  NIP: {g.nip.substring(0, 8)}...
                </span>
              </div>
            </div>

            <div className="px-8 py-6 bg-stone-50/50 space-y-3">
              <div className="flex items-center gap-3 text-sm text-stone-600">
                <Mail size={14} className="text-stone-400" />
                <span className="truncate">{g.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-600">
                <Phone size={14} className="text-stone-400" />
                <span>{g.telepon}</span>
              </div>
            </div>

            <div className="p-4 border-t border-stone-100 flex items-center justify-between bg-white">
              <button className="p-2 rounded-xl hover:bg-stone-50 text-stone-400 hover:text-cyan-600 transition-all">
                <Edit2 size={16} />
              </button>
              <button className="p-2 rounded-xl hover:bg-stone-50 text-stone-400 hover:text-rose-600 transition-all">
                <Trash2 size={16} />
              </button>
              <button className="flex items-center gap-1 px-4 py-2 rounded-xl hover:bg-stone-50 text-stone-600 font-bold text-xs transition-all">
                Profil <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Placeholder */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-stone-100 flex items-center justify-between">
                <h3 className="text-2xl font-serif font-bold text-stone-800">Tambah Guru/Staf</h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-full hover:bg-stone-100 text-stone-400 transition-colors"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Nama Lengkap & Gelar</label>
                  <input type="text" placeholder="Contoh: Siti Aminah, S.Pd" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">NIP</label>
                  <input type="text" placeholder="18 digit NIP" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Jabatan</label>
                  <input type="text" placeholder="Contoh: Guru Kelas A1" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Email</label>
                  <input type="email" placeholder="email@sekolah.id" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Telepon/WA</label>
                  <input type="tel" placeholder="08..." className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Status</label>
                  <select className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20">
                    <option>Aktif</option>
                    <option>Cuti</option>
                    <option>Non-Aktif</option>
                  </select>
                </div>
              </div>
              <div className="p-8 bg-stone-50 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-stone-500 font-bold text-sm hover:text-stone-700 transition-all"
                >
                  Batal
                </button>
                <button className="px-8 py-3 bg-cyan-600 text-white rounded-2xl font-bold text-sm hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-200/50">
                  Simpan Data
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
