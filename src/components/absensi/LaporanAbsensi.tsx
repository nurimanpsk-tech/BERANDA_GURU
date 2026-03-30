import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  ChevronRight, 
  ChevronLeft,
  Printer,
  FileSpreadsheet,
  FileJson,
  TrendingUp,
  TrendingDown,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface LaporanRecord {
  id: string;
  nama: string;
  kelas: string;
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  persentase: number;
}

const initialLaporan: LaporanRecord[] = [
  { id: '1', nama: 'Budi Santoso', kelas: 'Kelas A1', hadir: 20, sakit: 1, izin: 1, alpa: 0, persentase: 90.9 },
  { id: '2', nama: 'Siti Aminah', kelas: 'Kelas A1', hadir: 22, sakit: 0, izin: 0, alpa: 0, persentase: 100 },
  { id: '3', nama: 'Ahmad Fauzi', kelas: 'Kelas A2', hadir: 18, sakit: 2, izin: 2, alpa: 0, persentase: 81.8 },
  { id: '4', nama: 'Lani Wijaya', kelas: 'Kelas B1', hadir: 21, sakit: 1, izin: 0, alpa: 0, persentase: 95.4 },
  { id: '5', nama: 'Dewi Sartika', kelas: 'Kelas B2', hadir: 19, sakit: 1, izin: 2, alpa: 0, persentase: 86.3 },
];

const trendData = [
  { name: 'Jan', persentase: 88 },
  { name: 'Feb', persentase: 92 },
  { name: 'Mar', persentase: 95 },
  { name: 'Apr', persentase: 90 },
  { name: 'Mei', persentase: 94 },
  { name: 'Jun', persentase: 92 },
];

export default function LaporanAbsensi() {
  const [laporan, setLaporan] = useState<LaporanRecord[]>(initialLaporan);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('Maret 2026');

  const filteredLaporan = laporan.filter(l => 
    l.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.kelas.toLowerCase().includes(searchTerm.toLowerCase())
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
              placeholder="Cari nama atau kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-stone-200 shadow-sm">
            <CalendarIcon size={18} className="text-stone-400" />
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-sm font-bold text-stone-700 focus:outline-none bg-transparent"
            >
              <option>Januari 2026</option>
              <option>Februari 2026</option>
              <option>Maret 2026</option>
              <option>April 2026</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-stone-200 rounded-2xl text-stone-600 font-bold text-sm hover:bg-stone-50 transition-all shadow-sm">
            <Printer size={18} />
            Cetak
          </button>
          <div className="relative group">
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-2xl font-bold text-sm hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-200/50">
              <Download size={18} />
              Export Laporan
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-stone-100 p-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-20">
              <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 text-stone-600 text-sm font-bold transition-all">
                <FileSpreadsheet size={18} className="text-emerald-600" />
                Excel (.xlsx)
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 text-stone-600 text-sm font-bold transition-all">
                <FileText size={18} className="text-rose-600" />
                PDF (.pdf)
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 text-stone-600 text-sm font-bold transition-all">
                <FileJson size={18} className="text-amber-600" />
                JSON (.json)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-serif font-bold text-stone-800">Tren Kehadiran Bulanan</h3>
              <p className="text-sm text-stone-400">Persentase kehadiran rata-rata per bulan</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold">
              <TrendingUp size={14} />
              +4% dari bulan lalu
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  domain={[80, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '1rem', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '1rem'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="persentase" 
                  stroke="#0891b2" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#0891b2', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 flex flex-col justify-center">
          <div className="text-center mb-8">
            <div className="bg-cyan-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-4 text-cyan-600 shadow-inner">
              <Users size={32} />
            </div>
            <h4 className="text-2xl font-serif font-bold text-stone-800">92.4%</h4>
            <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Rata-rata Kehadiran</p>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-stone-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <TrendingUp size={16} />
                </div>
                <span className="text-sm font-bold text-stone-600">Tertinggi</span>
              </div>
              <span className="text-sm font-bold text-stone-800">Kelas A1 (98%)</span>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                  <TrendingDown size={16} />
                </div>
                <span className="text-sm font-bold text-stone-600">Terendah</span>
              </div>
              <span className="text-sm font-bold text-stone-800">Kelas B2 (85%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-100 overflow-hidden">
        <div className="p-8 border-b border-stone-100 flex items-center justify-between bg-stone-50/30">
          <h3 className="text-xl font-serif font-bold text-stone-800">Detail Kehadiran Siswa</h3>
          <span className="px-4 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-bold text-stone-500">
            Periode: {selectedMonth}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/50 border-b border-stone-100">
                <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest">Nama Siswa</th>
                <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest text-center">Hadir</th>
                <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest text-center">Sakit</th>
                <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest text-center">Izin</th>
                <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest text-center">Alpa</th>
                <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest text-center">Persentase</th>
                <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filteredLaporan.map((l) => (
                <motion.tr 
                  key={l.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-stone-50/50 transition-colors group"
                >
                  <td className="px-8 py-5">
                    <div>
                      <p className="font-bold text-stone-800">{l.nama}</p>
                      <p className="text-xs text-stone-400 font-medium">{l.kelas}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-sm font-bold text-emerald-600">{l.hadir}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-sm font-bold text-amber-600">{l.sakit}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-sm font-bold text-indigo-600">{l.izin}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-sm font-bold text-rose-600">{l.alpa}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-sm font-bold text-stone-800">{l.persentase}%</span>
                      <div className="w-20 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${l.persentase > 90 ? 'bg-emerald-500' : l.persentase > 80 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${l.persentase}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 rounded-xl hover:bg-white hover:shadow-sm text-stone-400 hover:text-cyan-600 transition-all">
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
