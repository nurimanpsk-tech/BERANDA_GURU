import React, { useState } from 'react';
import { ArrowLeft, Save, Calendar, UserCog, UserCircle } from 'lucide-react';
import { Staff } from '../types';

interface AbsensiGuruProps {
  onBack: () => void;
  isPrincipalView?: boolean;
}

const dummyStaff: Staff[] = [
  { id: '1', name: 'Kunlistyani, S.Pd', nip: '196805202008012015', role: 'kepala_sekolah' },
  { id: '2', name: 'Nur Iman P. S', nip: '198501012010011001', role: 'guru' },
  { id: '3', name: 'Nabila Anin Sau\'dah', nip: '199001012015012001', role: 'guru' },
  { id: '4', name: 'Siti Aminah, S.Pd', nip: '198801012012012001', role: 'guru' }
];

export default function AbsensiGuru({ onBack, isPrincipalView = false }: AbsensiGuruProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, 'hadir' | 'sakit' | 'izin' | 'alfa'>>({});

  const handleStatusChange = (staffId: string, status: 'hadir' | 'sakit' | 'izin' | 'alfa') => {
    setAttendance(prev => ({ ...prev, [staffId]: status }));
  };

  const handleSave = () => {
    console.log('Saving staff attendance:', { date: selectedDate, attendance });
    alert('Absensi berhasil disimpan!');
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 text-center relative">
          <button 
            onClick={onBack}
            className="absolute left-0 top-0 p-2 rounded-full hover:bg-stone-200 transition-colors"
            title="Kembali"
          >
            <ArrowLeft size={24} className="text-stone-600" />
          </button>
          <h1 className="text-4xl font-serif mb-4 tracking-tight">
            Absensi <span className="italic">{isPrincipalView ? 'Kepala Sekolah' : 'Guru'}</span>
          </h1>
          <p className="text-stone-500">
            {isPrincipalView 
              ? 'Laporan kehadiran Kepala Sekolah untuk keperluan manajerial.' 
              : 'Rekam kehadiran guru dan staf untuk manajemen SDM yang lebih baik.'}
          </p>
        </header>

        <div className="bg-white rounded-[2rem] shadow-xl border border-stone-100 overflow-hidden">
          <div className="p-6 md:p-8 bg-stone-50 border-bottom border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${isPrincipalView ? 'bg-violet-100 text-violet-600' : 'bg-indigo-100 text-indigo-600'}`}>
                {isPrincipalView ? <UserCircle size={24} /> : <UserCog size={24} />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-stone-800">Daftar Kehadiran</h2>
                <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">Unit Kerja: PAUD/TK</p>
              </div>
            </div>
            <div className="w-full md:w-64">
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Tanggal</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input 
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-100">
                    <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-widest text-stone-400">No</th>
                    <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-widest text-stone-400">Nama Lengkap</th>
                    <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-widest text-stone-400">Jabatan</th>
                    <th className="text-center py-4 px-4 text-xs font-bold uppercase tracking-widest text-stone-400">Hadir</th>
                    <th className="text-center py-4 px-4 text-xs font-bold uppercase tracking-widest text-stone-400">Sakit</th>
                    <th className="text-center py-4 px-4 text-xs font-bold uppercase tracking-widest text-stone-400">Izin</th>
                    <th className="text-center py-4 px-4 text-xs font-bold uppercase tracking-widest text-stone-400">Alfa</th>
                  </tr>
                </thead>
                <tbody>
                  {dummyStaff
                    .filter(s => isPrincipalView ? s.role === 'kepala_sekolah' : true)
                    .map((staff, index) => (
                    <tr key={staff.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                      <td className="py-4 px-4 text-stone-500 font-mono text-sm">{index + 1}</td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-stone-800">{staff.name}</div>
                        <div className="text-xs text-stone-400 font-mono">NIP: {staff.nip}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${staff.role === 'kepala_sekolah' ? 'bg-violet-100 text-violet-700' : 'bg-indigo-100 text-indigo-700'}`}>
                          {staff.role === 'kepala_sekolah' ? 'Kepala Sekolah' : 'Guru'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <input 
                          type="radio" 
                          name={`attendance-${staff.id}`}
                          checked={attendance[staff.id] === 'hadir'}
                          onChange={() => handleStatusChange(staff.id, 'hadir')}
                          className={`w-5 h-5 ${isPrincipalView ? 'accent-violet-500' : 'accent-indigo-500'}`}
                        />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <input 
                          type="radio" 
                          name={`attendance-${staff.id}`}
                          checked={attendance[staff.id] === 'sakit'}
                          onChange={() => handleStatusChange(staff.id, 'sakit')}
                          className="w-5 h-5 accent-amber-500"
                        />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <input 
                          type="radio" 
                          name={`attendance-${staff.id}`}
                          checked={attendance[staff.id] === 'izin'}
                          onChange={() => handleStatusChange(staff.id, 'izin')}
                          className="w-5 h-5 accent-blue-500"
                        />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <input 
                          type="radio" 
                          name={`attendance-${staff.id}`}
                          checked={attendance[staff.id] === 'alfa'}
                          onChange={() => handleStatusChange(staff.id, 'alfa')}
                          className="w-5 h-5 accent-rose-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-6 md:p-8 bg-stone-50 border-t border-stone-100 flex justify-end">
            <button 
              onClick={handleSave}
              className={`flex items-center gap-2 px-8 py-3 text-white rounded-xl font-bold transition-all shadow-lg ${isPrincipalView ? 'bg-violet-600 hover:bg-violet-700 shadow-violet-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
            >
              <Save size={20} />
              SIMPAN ABSENSI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
