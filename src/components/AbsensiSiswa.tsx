import React, { useState } from 'react';
import { ArrowLeft, Save, Calendar, Users } from 'lucide-react';
import { Student, AttendanceRecord, Class } from '../types';

interface AbsensiSiswaProps {
  onBack: () => void;
}

const dummyClasses: Class[] = [
  { id: '1', name: 'TK A', teacherName: 'Nur Iman P. S', principalName: 'Kunlistyani, S.Pd' },
  { id: '2', name: 'TK B', teacherName: 'Nabila Anin Sau\'dah', principalName: 'Kunlistyani, S.Pd' }
];

const dummyStudents: Student[] = [
  { id: '1', name: 'SILVIA AGUSTIN NUR CAHYANI', nis: '002', classId: '2' },
  { id: '2', name: 'SAFIRA ALMIRA SALMA', nis: '003', classId: '2' },
  { id: '3', name: 'JOANNA IASHA PRASETYANI', nis: '004', classId: '2' },
  { id: '4', name: 'ANANTA SHAHREEN KHOLIFATUNISA', nis: '005', classId: '2' },
  { id: '5', name: 'KENAN DIKA ABISATYA NURROHKIM', nis: '006', classId: '2' },
  { id: '6', name: 'KENZO DIKI ABISATYA NURROHKIM', nis: '007', classId: '2' },
  { id: '7', name: 'DANISH ALFARIZQI PUTRA WIESTHA', nis: '008', classId: '2' },
  { id: '8', name: 'NAFIZA AZZAHRA SABRINA', nis: '001', classId: '2' }
];

export default function AbsensiSiswa({ onBack }: AbsensiSiswaProps) {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, 'hadir' | 'sakit' | 'izin' | 'alfa'>>({});

  const filteredStudents = dummyStudents.filter(s => s.classId === selectedClass);

  const handleStatusChange = (studentId: string, status: 'hadir' | 'sakit' | 'izin' | 'alfa') => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = () => {
    console.log('Saving attendance:', { date: selectedDate, classId: selectedClass, attendance });
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
            Absensi <span className="italic">Siswa</span>
          </h1>
          <p className="text-stone-500">Rekam kehadiran anak didik dengan teliti setiap harinya.</p>
        </header>

        <div className="bg-white rounded-[2rem] shadow-xl border border-stone-100 overflow-hidden">
          <div className="p-6 md:p-8 bg-stone-50 border-bottom border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Pilih Kelas</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <select 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-cyan-500 outline-none appearance-none bg-white transition-all"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {dummyClasses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Tanggal</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input 
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-cyan-500 outline-none bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {!selectedClass ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={32} className="text-stone-300" />
                </div>
                <p className="text-stone-400">Silakan pilih kelas terlebih dahulu untuk melihat daftar siswa.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-100">
                      <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-widest text-stone-400">No</th>
                      <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-widest text-stone-400">Nama Siswa</th>
                      <th className="text-center py-4 px-4 text-xs font-bold uppercase tracking-widest text-stone-400">Hadir</th>
                      <th className="text-center py-4 px-4 text-xs font-bold uppercase tracking-widest text-stone-400">Sakit</th>
                      <th className="text-center py-4 px-4 text-xs font-bold uppercase tracking-widest text-stone-400">Izin</th>
                      <th className="text-center py-4 px-4 text-xs font-bold uppercase tracking-widest text-stone-400">Alfa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, index) => (
                      <tr key={student.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                        <td className="py-4 px-4 text-stone-500 font-mono text-sm">{index + 1}</td>
                        <td className="py-4 px-4 font-medium text-stone-800">{student.name}</td>
                        <td className="py-4 px-4 text-center">
                          <input 
                            type="radio" 
                            name={`attendance-${student.id}`}
                            checked={attendance[student.id] === 'hadir'}
                            onChange={() => handleStatusChange(student.id, 'hadir')}
                            className="w-5 h-5 accent-emerald-500"
                          />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <input 
                            type="radio" 
                            name={`attendance-${student.id}`}
                            checked={attendance[student.id] === 'sakit'}
                            onChange={() => handleStatusChange(student.id, 'sakit')}
                            className="w-5 h-5 accent-amber-500"
                          />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <input 
                            type="radio" 
                            name={`attendance-${student.id}`}
                            checked={attendance[student.id] === 'izin'}
                            onChange={() => handleStatusChange(student.id, 'izin')}
                            className="w-5 h-5 accent-blue-500"
                          />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <input 
                            type="radio" 
                            name={`attendance-${student.id}`}
                            checked={attendance[student.id] === 'alfa'}
                            onChange={() => handleStatusChange(student.id, 'alfa')}
                            className="w-5 h-5 accent-rose-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {selectedClass && (
            <div className="p-6 md:p-8 bg-stone-50 border-t border-stone-100 flex justify-end">
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-200"
              >
                <Save size={20} />
                SIMPAN ABSENSI
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
