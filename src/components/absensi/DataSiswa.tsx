import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Users, 
  UserPlus,
  Filter,
  Download,
  Upload,
  ChevronRight,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Siswa {
  id: string;
  nisn: string;
  nama: string;
  kelas: string;
  jenisKelamin: 'L' | 'P';
  status: 'Aktif' | 'Lulus' | 'Pindah';
  foto?: string;
}

const initialSiswa: Siswa[] = [
  { id: '1', nisn: '0123456789', nama: 'Budi Santoso', kelas: 'Kelas A1', jenisKelamin: 'L', status: 'Aktif' },
  { id: '2', nisn: '0123456790', nama: 'Siti Aminah', kelas: 'Kelas A1', jenisKelamin: 'P', status: 'Aktif' },
  { id: '3', nisn: '0123456791', nama: 'Ahmad Fauzi', kelas: 'Kelas A2', jenisKelamin: 'L', status: 'Aktif' },
  { id: '4', nisn: '0123456792', nama: 'Lani Wijaya', kelas: 'Kelas B1', jenisKelamin: 'P', status: 'Aktif' },
  { id: '5', nisn: '0123456793', nama: 'Dewi Sartika', kelas: 'Kelas B2', jenisKelamin: 'P', status: 'Aktif' },
];

export default function DataSiswa() {
  const [siswa, setSiswa] = useState<Siswa[]>(initialSiswa);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filteredSiswa = siswa.filter(s => 
    s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.nisn.includes(searchTerm) ||
    s.kelas.toLowerCase().includes(searchTerm.toLowerCase())
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
              placeholder="Cari NISN, nama, atau kelas..."
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
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-stone-200 rounded-2xl text-stone-600 font-bold text-sm hover:bg-stone-50 transition-all shadow-sm">
            <Download size={18} />
            Export
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-stone-200 rounded-2xl text-stone-600 font-bold text-sm hover:bg-stone-50 transition-all shadow-sm">
            <Upload size={18} />
            Import
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-2xl font-bold text-sm hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-200/50"
          >
            <UserPlus size={18} />
            Tambah Siswa
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
          <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1">Total Siswa</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-serif font-bold text-stone-800">{siswa.length}</p>
            <div className="bg-cyan-50 p-2 rounded-xl text-cyan-600">
              <Users size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
          <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1">Laki-laki</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-serif font-bold text-stone-800">
              {siswa.filter(s => s.jenisKelamin === 'L').length}
            </p>
            <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
              <Users size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
          <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1">Perempuan</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-serif font-bold text-stone-800">
              {siswa.filter(s => s.jenisKelamin === 'P').length}
            </p>
            <div className="bg-pink-50 p-2 rounded-xl text-pink-600">
              <Users size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
          <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1">Status Aktif</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-serif font-bold text-stone-800">
              {siswa.filter(s => s.status === 'Aktif').length}
            </p>
            <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
              <ShieldCheck size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/50 border-b border-stone-100">
                <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest">Siswa</th>
                <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest">NISN</th>
                <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest text-center">Kelas</th>
                <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest text-center">L/P</th>
                <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filteredSiswa.map((s) => (
                <motion.tr 
                  key={s.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-stone-50/50 transition-colors group"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 font-bold overflow-hidden shadow-sm">
                        {s.foto ? <img src={s.foto} alt={s.nama} className="w-full h-full object-cover" /> : s.nama.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-stone-800">{s.nama}</p>
                        <p className="text-xs text-stone-400 font-medium">ID: {s.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-stone-600 font-mono text-sm">{s.nisn}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-cyan-50 text-cyan-700 text-xs font-bold">
                      {s.kelas}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                      s.jenisKelamin === 'L' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                    }`}>
                      {s.jenisKelamin}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      s.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-stone-400'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-stone-400 hover:text-cyan-600 transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-stone-400 hover:text-rose-600 transition-all">
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-stone-400 hover:text-stone-600 transition-all">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
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
                <h3 className="text-2xl font-serif font-bold text-stone-800">Tambah Siswa Baru</h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-full hover:bg-stone-100 text-stone-400 transition-colors"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Nama Lengkap</label>
                  <input type="text" placeholder="Nama lengkap siswa" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">NISN</label>
                  <input type="text" placeholder="10 digit NISN" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Kelas</label>
                  <select className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20">
                    <option>Pilih Kelas...</option>
                    <option>Kelas A1</option>
                    <option>Kelas A2</option>
                    <option>Kelas B1</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Jenis Kelamin</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="jk" className="w-4 h-4 text-cyan-600" />
                      <span className="text-sm font-medium text-stone-600">Laki-laki</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="jk" className="w-4 h-4 text-cyan-600" />
                      <span className="text-sm font-medium text-stone-600">Perempuan</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Alamat</label>
                  <textarea rows={3} placeholder="Alamat lengkap siswa" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20"></textarea>
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
