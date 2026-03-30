import React from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  TrendingUp, 
  Calendar as CalendarIcon 
} from 'lucide-react';
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
import { motion } from 'motion/react';

const data = [
  { name: 'Senin', hadir: 45, sakit: 2, izin: 1, alpa: 0 },
  { name: 'Selasa', hadir: 42, sakit: 3, izin: 2, alpa: 1 },
  { name: 'Rabu', hadir: 48, sakit: 0, izin: 0, alpa: 0 },
  { name: 'Kamis', hadir: 44, sakit: 1, izin: 2, alpa: 1 },
  { name: 'Jumat', hadir: 40, sakit: 4, izin: 3, alpa: 1 },
];

const pieData = [
  { name: 'Hadir', value: 85, color: '#0891b2' },
  { name: 'Sakit', value: 5, color: '#f59e0b' },
  { name: 'Izin', value: 7, color: '#6366f1' },
  { name: 'Alpa', value: 3, color: '#ef4444' },
];

export default function Beranda() {
  const stats = [
    { title: 'Total Siswa', value: '48', icon: <Users size={24} />, color: 'bg-blue-500', trend: '+2% dari bulan lalu' },
    { title: 'Hadir Hari Ini', value: '45', icon: <UserCheck size={24} />, color: 'bg-emerald-500', trend: '94% Kehadiran' },
    { title: 'Sakit/Izin', value: '3', icon: <UserX size={24} />, color: 'bg-amber-500', trend: 'Menurun dari kemarin' },
    { title: 'Rata-rata Kehadiran', value: '92%', icon: <TrendingUp size={24} />, color: 'bg-indigo-500', trend: 'Sangat Baik' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg shadow-stone-200/50`}>
                {stat.icon}
              </div>
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Statistik</span>
            </div>
            <div>
              <h3 className="text-stone-500 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-serif font-bold text-stone-800">{stat.value}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-stone-50 flex items-center gap-1 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              <TrendingUp size={12} className="text-emerald-500" />
              {stat.trend}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-serif font-bold text-stone-800">Grafik Kehadiran Mingguan</h3>
              <p className="text-sm text-stone-400">Data kehadiran siswa per hari dalam seminggu terakhir</p>
            </div>
            <div className="flex items-center gap-2 bg-stone-50 p-1 rounded-xl">
              <button className="px-4 py-1.5 rounded-lg bg-white shadow-sm text-xs font-bold text-cyan-700">Siswa</button>
              <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-stone-400 hover:text-stone-600">Guru</button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
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
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '1rem', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '1rem'
                  }}
                />
                <Bar dataKey="hadir" fill="#0891b2" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100">
          <h3 className="text-xl font-serif font-bold text-stone-800 mb-2">Status Kehadiran</h3>
          <p className="text-sm text-stone-400 mb-8">Persentase kehadiran bulan ini</p>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-serif font-bold text-stone-800">92%</span>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Total</span>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-stone-600 font-medium">{item.name}</span>
                </div>
                <span className="text-stone-800 font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-serif font-bold text-stone-800">Aktivitas Terbaru</h3>
          <button className="text-xs font-bold text-cyan-600 hover:text-cyan-700 uppercase tracking-widest">Lihat Semua</button>
        </div>
        <div className="space-y-6">
          {[
            { name: 'Budi Santoso', action: 'Absen Masuk', time: '07:15', status: 'Hadir', color: 'text-emerald-600 bg-emerald-50' },
            { name: 'Siti Aminah', action: 'Izin Sakit', time: '07:45', status: 'Sakit', color: 'text-amber-600 bg-amber-50' },
            { name: 'Ahmad Fauzi', action: 'Absen Masuk', time: '08:05', status: 'Terlambat', color: 'text-rose-600 bg-rose-50' },
            { name: 'Lani Wijaya', action: 'Absen Masuk', time: '07:20', status: 'Hadir', color: 'text-emerald-600 bg-emerald-50' },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-2xl hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 font-bold">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-800">{item.name}</p>
                  <p className="text-xs text-stone-400">{item.action} • {item.time}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${item.color}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
