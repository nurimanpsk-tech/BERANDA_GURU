import React, { useState } from 'react';
import { 
  Users, 
  UserCog, 
  Calendar as CalendarIcon, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Save,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type AbsensiType = 'siswa' | 'guru';
type Status = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' | 'Terlambat';

interface AbsensiRecord {
  id: string;
  nama: string;
  status: Status;
  keterangan?: string;
  waktu?: string;
}

const initialSiswa: AbsensiRecord[] = [
  { id: '1', nama: 'Budi Santoso', status: 'Hadir', waktu: '07:15' },
  { id: '2', nama: 'Siti Aminah', status: 'Hadir', waktu: '07:10' },
  { id: '3', nama: 'Ahmad Fauzi', status: 'Hadir', waktu: '07:20' },
  { id: '4', nama: 'Lani Wijaya', status: 'Hadir', waktu: '07:15' },
  { id: '5', nama: 'Dewi Sartika', status: 'Hadir', waktu: '07:12' },
];

const initialGuru: AbsensiRecord[] = [
  { id: 'g1', nama: 'Siti Aminah, S.Pd', status: 'Hadir', waktu: '06:45' },
  { id: 'g2', nama: 'Budi Santoso, S.Pd', status: 'Hadir', waktu: '06:50' },
  { id: 'g3', nama: 'Lani Wijaya, S.Pd', status: 'Hadir', waktu: '06:55' },
];

export default function InputAbsensi() {
  const [type, setType] = useState<AbsensiType>('siswa');
  const [records, setRecords] = useState<AbsensiRecord[]>(type === 'siswa' ? initialSiswa : initialGuru);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedKelas, setSelectedKelas] = useState('Kelas A1');

  const handleStatusChange = (id: string, newStatus: Status) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'Hadir': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Sakit': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Izin': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'Alpa': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Terlambat': return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-stone-50 text-stone-400 border-stone-100';
    }
  };

  return (
    <div className="space-y-8">
      {/* Type Toggle & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-stone-200 shadow-sm self-start">
          <button 
            onClick={() => setType('siswa')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              type === 'siswa' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-200/50' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <Users size={18} />
            Absensi Siswa
          </button>
          <button 
            onClick={() => setType('guru')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              type === 'guru' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200/50' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <UserCog size={18} />
            Absensi Guru
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-stone-200 shadow-sm">
            <CalendarIcon size={18} className="text-stone-400" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm font-bold text-stone-700 focus:outline-none bg-transparent"
            />
          </div>
          {type === 'siswa' && (
            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-stone-200 shadow-sm">
              <Filter size={18} className="text-stone-400" />
              <select 
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="text-sm font-bold text-stone-700 focus:outline-none bg-transparent"
              >
                <option>Kelas A1</option>
                <option>Kelas A2</option>
                <option>Kelas B1</option>
                <option>Kelas B2</option>
              </select>
            </div>
          )}
          <button className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200/50">
            <Save size={18} />
            Simpan Absensi
          </button>
        </div>
      </div>

      {/* Attendance List */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-100 overflow-hidden">
        <div className="p-8 border-b border-stone-100 flex items-center justify-between bg-stone-50/30">
          <div>
            <h3 className="text-xl font-serif font-bold text-stone-800">
              Daftar {type === 'siswa' ? 'Siswa' : 'Guru'}
            </h3>
            <p className="text-sm text-stone-400">Pilih status kehadiran untuk setiap {type === 'siswa' ? 'siswa' : 'guru'}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Hadir: 45</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Izin: 3</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/50 border-b border-stone-100">
                <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest">Nama {type === 'siswa' ? 'Siswa' : 'Guru'}</th>
                <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest text-center">Status Kehadiran</th>
                <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest text-center">Waktu</th>
                <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {records.map((record) => (
                <motion.tr 
                  key={record.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-stone-50/50 transition-colors group"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 font-bold">
                        {record.nama.charAt(0)}
                      </div>
                      <span className="font-bold text-stone-800">{record.nama}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-2">
                      {(['Hadir', 'Sakit', 'Izin', 'Alpa', 'Terlambat'] as Status[]).map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(record.id, status)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                            record.status === status 
                              ? getStatusColor(status) 
                              : 'bg-white text-stone-400 border-stone-100 hover:border-stone-200'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-100 text-stone-600 text-xs font-bold">
                      <Clock size={14} />
                      {record.waktu || '--:--'}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <input 
                      type="text"
                      placeholder="Tambahkan catatan..."
                      className="w-full px-4 py-2 bg-transparent border-b border-transparent focus:border-cyan-500 focus:outline-none text-sm text-stone-600 transition-all"
                    />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 flex items-center gap-6">
          <div className="bg-emerald-50 p-5 rounded-3xl text-emerald-600">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <h4 className="text-lg font-serif font-bold text-stone-800 mb-1">Hadir Semua</h4>
            <p className="text-sm text-stone-400 mb-4">Tandai semua {type === 'siswa' ? 'siswa' : 'guru'} hadir hari ini.</p>
            <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest">Terapkan Sekarang</button>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 flex items-center gap-6">
          <div className="bg-amber-50 p-5 rounded-3xl text-amber-600">
            <AlertCircle size={32} />
          </div>
          <div>
            <h4 className="text-lg font-serif font-bold text-stone-800 mb-1">Belum Absen</h4>
            <p className="text-sm text-stone-400 mb-4">Terdapat 3 {type === 'siswa' ? 'siswa' : 'guru'} yang belum diisi statusnya.</p>
            <button className="text-xs font-bold text-amber-600 hover:text-amber-700 uppercase tracking-widest">Lihat Daftar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
