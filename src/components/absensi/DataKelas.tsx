import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Users, 
  GraduationCap,
  School,
  ChevronRight,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Kelas {
  id: string;
  nama: string;
  waliKelas: string;
  jumlahSiswa: number;
  tahunAjaran: string;
  status: 'Aktif' | 'Non-Aktif';
}

const initialKelas: Kelas[] = [
  { id: '1', nama: 'Kelas A1', waliKelas: 'Siti Aminah, S.Pd', jumlahSiswa: 15, tahunAjaran: '2025/2026', status: 'Aktif' },
  { id: '2', nama: 'Kelas A2', waliKelas: 'Budi Santoso, S.Pd', jumlahSiswa: 12, tahunAjaran: '2025/2026', status: 'Aktif' },
  { id: '3', nama: 'Kelas B1', waliKelas: 'Lani Wijaya, S.Pd', jumlahSiswa: 18, tahunAjaran: '2025/2026', status: 'Aktif' },
  { id: '4', nama: 'Kelas B2', waliKelas: 'Ahmad Fauzi, S.Pd', jumlahSiswa: 14, tahunAjaran: '2025/2026', status: 'Aktif' },
];

export default function DataKelas() {
  const [kelas, setKelas] = useState<Kelas[]>(initialKelas);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filteredKelas = kelas.filter(k => 
    k.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.waliKelas.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text"
            placeholder="Cari kelas atau wali kelas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-stone-200 rounded-2xl text-stone-600 font-bold text-sm hover:bg-stone-50 transition-all shadow-sm">
            <Filter size={18} />
            Filter
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-2xl font-bold text-sm hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-200/50"
          >
            <Plus size={18} />
            Tambah Kelas
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex items-center gap-4">
          <div className="bg-cyan-50 p-4 rounded-2xl text-cyan-600">
            <School size={24} />
          </div>
          <div>
            <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Total Kelas</p>
            <p className="text-2xl font-serif font-bold text-stone-800">{kelas.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex items-center gap-4">
          <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Total Siswa</p>
            <p className="text-2xl font-serif font-bold text-stone-800">
              {kelas.reduce((acc, curr) => acc + curr.jumlahSiswa, 0)}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex items-center gap-4">
          <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600">
            <GraduationCap size={24} />
          </div>
          <div>
            <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Tahun Ajaran</p>
            <p className="text-2xl font-serif font-bold text-stone-800">2025/2026</p>
          </div>
        </div>
      </div>

      {/* Table/Grid */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/50 border-b border-stone-100">
                <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest">Nama Kelas</th>
                <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest">Wali Kelas</th>
                <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest text-center">Jumlah Siswa</th>
                <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filteredKelas.map((k) => (
                <motion.tr 
                  key={k.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-stone-50/50 transition-colors group"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 font-bold">
                        {k.nama.split(' ')[1]}
                      </div>
                      <span className="font-bold text-stone-800">{k.nama}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-stone-600 font-medium">{k.waliKelas}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-bold">
                      <Users size={12} />
                      {k.jumlahSiswa} Siswa
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      k.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-stone-400'
                    }`}>
                      {k.status}
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
        {filteredKelas.length === 0 && (
          <div className="p-20 text-center">
            <div className="bg-stone-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <School size={32} className="text-stone-300" />
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-800 mb-2">Tidak Ada Data Kelas</h3>
            <p className="text-stone-400 max-w-xs mx-auto">Coba cari dengan kata kunci lain atau tambahkan kelas baru.</p>
          </div>
        )}
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
              className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-stone-100 flex items-center justify-between">
                <h3 className="text-2xl font-serif font-bold text-stone-800">Tambah Kelas Baru</h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-full hover:bg-stone-100 text-stone-400 transition-colors"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Nama Kelas</label>
                  <input type="text" placeholder="Contoh: Kelas A1" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Wali Kelas</label>
                  <select className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20">
                    <option>Pilih Guru...</option>
                    <option>Siti Aminah, S.Pd</option>
                    <option>Budi Santoso, S.Pd</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Tahun Ajaran</label>
                    <input type="text" defaultValue="2025/2026" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Kapasitas</label>
                    <input type="number" placeholder="20" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
                  </div>
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
                  Simpan Kelas
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
