import React, { useState } from 'react';
import { Sparkles, BookOpen, CheckSquare, Palette, Image, ArrowRight, ClipboardCheck, ArrowLeft, GraduationCap, Users, Settings, Wallet, UserCheck, UserCog, UserCircle, Mail, Inbox, Send, Contact, Megaphone, Database, LogOut, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '@supabase/supabase-js';

interface HomeProps {
  onNavigate: (page: string) => void;
  hasPPMData: boolean;
  initialShowAsesmen?: boolean;
  initialShowAbsensi?: boolean;
  initialShowAdmin?: boolean;
  user: User | null;
  profile?: any;
  isAdmin: boolean;
}

export default function Home({ 
  onNavigate, 
  hasPPMData, 
  initialShowAsesmen = false,
  initialShowAbsensi = false,
  initialShowAdmin = false,
  user,
  profile,
  isAdmin,
}: HomeProps) {
  const [showAsesmenMenu, setShowAsesmenMenu] = useState(initialShowAsesmen);
  const [showAbsensiMenu, setShowAbsensiMenu] = useState(initialShowAbsensi);
  const [showSuratMenu, setShowSuratMenu] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(initialShowAdmin && isAdmin);

  const adminItems = [
    {
      id: 'curriculum',
      title: 'Kelola Capaian Pembelajaran',
      description: 'Input daftar TP dan IKTP dari Pengawas untuk referensi AI.',
      icon: <Database size={28} className="text-purple-600" />,
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
      textColor: 'text-purple-900',
    },
    {
      id: 'users',
      title: 'Daftar Pengguna',
      description: 'Pantau siapa saja yang mendaftar dan aktif di sistem.',
      icon: <Users size={28} className="text-emerald-600" />,
      color: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200',
      textColor: 'text-emerald-900',
    }
  ];

  const suratItems = [
    {
      id: 'surat-masuk',
      title: 'Surat Masuk',
      description: 'Arsip dan manajemen surat yang diterima sekolah.',
      icon: <Inbox size={28} className="text-pink-600" />,
      color: 'bg-pink-50 hover:bg-pink-100 border-pink-200',
      textColor: 'text-pink-900',
    },
    {
      id: 'surat-keluar',
      title: 'Surat Keluar',
      description: 'Pencatatan dan pembuatan surat resmi keluar.',
      icon: <Send size={28} className="text-orange-600" />,
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
      textColor: 'text-orange-900',
    }
  ];

  const asesmenItems = [
    {
      id: 'anekdot',
      title: 'Catatan Anekdot',
      description: 'Rekam kejadian bermakna dalam perkembangan anak.',
      icon: <BookOpen size={28} className="text-blue-600" />,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      textColor: 'text-blue-900',
    },
    {
      id: 'ceklist',
      title: 'Ceklist',
      description: 'Pantau indikator perkembangan anak secara terstruktur.',
      icon: <CheckSquare size={28} className="text-purple-600" />,
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
      textColor: 'text-purple-900',
    },
    {
      id: 'hasilkarya',
      title: 'Hasil Karya',
      description: 'Dokumentasikan dan analisis hasil karya anak.',
      icon: <Palette size={28} className="text-orange-600" />,
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
      textColor: 'text-orange-900',
    },
    {
      id: 'foto-berseri',
      title: 'Foto Berseri',
      description: 'Rangkaian foto kegiatan anak dengan deskripsi.',
      icon: <Image size={28} className="text-rose-600" />,
      color: 'bg-rose-50 hover:bg-rose-100 border-rose-200',
      textColor: 'text-rose-900',
    }
  ];

  const absensiItems = [
    {
      id: 'absensi-siswa',
      title: 'Absensi Siswa',
      description: 'Rekapitulasi kehadiran harian dan bulanan siswa.',
      icon: <UserCheck size={28} className="text-cyan-600" />,
      color: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200',
      textColor: 'text-cyan-900',
    },
    {
      id: 'absensi-guru',
      title: 'Absensi Guru',
      description: 'Sistem absensi dan jam kerja guru/staf.',
      icon: <UserCog size={28} className="text-amber-600" />,
      color: 'bg-amber-50 hover:bg-amber-100 border-amber-200',
      textColor: 'text-amber-900',
    },
    {
      id: 'absensi-ks',
      title: 'Absensi KS',
      description: 'Kehadiran Kepala Sekolah dan laporan manajerial.',
      icon: <UserCircle size={28} className="text-violet-600" />,
      color: 'bg-violet-50 hover:bg-violet-100 border-violet-200',
      textColor: 'text-violet-900',
    }
  ];

  const mainMenuItems = isAdmin 
    ? [
        {
          id: 'curriculum',
          title: 'Kelola Capaian Pembelajaran',
          description: 'Input daftar TP dan IKTP dari Pengawas untuk referensi AI.',
          icon: <Database size={32} className="text-purple-600" />,
          color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
          textColor: 'text-purple-900',
          action: () => onNavigate('curriculum')
        },
        {
          id: 'users',
          title: 'Daftar Pengguna',
          description: 'Pantau siapa saja yang mendaftar dan aktif di sistem.',
          icon: <Users size={32} className="text-emerald-600" />,
          color: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200',
          textColor: 'text-emerald-900',
          action: () => onNavigate('users')
        },
        {
          id: 'pengaturan',
          title: 'Pengaturan',
          description: 'Kelola profil, keamanan, dan preferensi aplikasi Anda.',
          icon: <Settings size={32} className="text-stone-600" />,
          color: 'bg-stone-50 hover:bg-stone-100 border-stone-200',
          textColor: 'text-stone-900',
          action: () => onNavigate('pengaturan')
        }
      ]
    : [
        {
          id: 'ppm',
          title: 'PPM',
          description: 'Buat Perencanaan Pembelajaran Mendalam otomatis dengan AI.',
          icon: <Sparkles size={32} className="text-emerald-600" />,
          color: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200',
          textColor: 'text-emerald-900',
          action: () => onNavigate('ppm')
        },
        {
          id: 'asesmen',
          title: 'Asesmen',
          description: 'Catatan anekdot, ceklis, hasil karya, dan foto berseri.',
          icon: <ClipboardCheck size={32} className="text-blue-600" />,
          color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
          textColor: 'text-blue-900',
          action: () => setShowAsesmenMenu(true)
        },
        {
          id: 'rapot',
          title: 'Rapot',
          description: 'Penyusunan laporan capaian pembelajaran per semester.',
          icon: <GraduationCap size={32} className="text-amber-600" />,
          color: 'bg-amber-50 hover:bg-amber-100 border-amber-200',
          textColor: 'text-amber-900',
          action: () => onNavigate('rapot')
        },
        {
          id: 'absensi',
          title: 'Absensi',
          description: 'Manajemen kehadiran Siswa, Guru, dan Kepala Sekolah.',
          icon: <Users size={32} className="text-cyan-600" />,
          color: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200',
          textColor: 'text-cyan-900',
          action: () => onNavigate('absensi')
        },
        {
          id: 'buku-induk',
          title: 'Buku Induk',
          description: 'Database lengkap profil siswa, riwayat masuk, dan keluar.',
          icon: <Contact size={32} className="text-amber-600" />,
          color: 'bg-amber-50 hover:bg-amber-100 border-amber-200',
          textColor: 'text-amber-900',
          action: () => onNavigate('buku-induk')
        },
        {
          id: 'pengumuman',
          title: 'AI Pengumuman',
          description: 'Buat teks pengumuman rapi untuk grup WA dalam sekejap.',
          icon: <Megaphone size={32} className="text-orange-600" />,
          color: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
          textColor: 'text-orange-900',
          action: () => onNavigate('pengumuman')
        },
        {
          id: 'surat',
          title: 'Surat',
          description: 'Manajemen administrasi surat masuk dan surat keluar.',
          icon: <Mail size={32} className="text-pink-600" />,
          color: 'bg-pink-50 hover:bg-pink-100 border-pink-200',
          textColor: 'text-pink-900',
          action: () => setShowSuratMenu(true)
        },
        {
          id: 'uang-kas',
          title: 'Uang Kas',
          description: 'Manajemen keuangan dan laporan uang kas sekolah.',
          icon: <Wallet size={32} className="text-rose-600" />,
          color: 'bg-rose-50 hover:bg-rose-100 border-rose-200',
          textColor: 'text-rose-900',
          action: () => onNavigate('uang-kas')
        },
        {
          id: 'pengaturan',
          title: 'Pengaturan',
          description: 'Kelola profil, keamanan, dan preferensi aplikasi Anda.',
          icon: <Settings size={32} className="text-stone-600" />,
          color: 'bg-stone-50 hover:bg-stone-100 border-stone-200',
          textColor: 'text-stone-900',
          action: () => onNavigate('pengaturan')
        }
      ];

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans p-4 md:p-8 flex flex-col justify-center items-center">
      <div className="max-w-6xl w-full">
        {!showAsesmenMenu && !showAbsensiMenu && !showSuratMenu && !showAdminMenu && (
          <header className="mb-12 text-center relative">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-200 text-stone-600 text-xs font-semibold uppercase tracking-wider mb-4"
            >
              <span className="flex items-center gap-2">
                <Sparkles size={14} />
                Administrasi Sekolah - Platform Administrasi Terpadu
              </span>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-serif font-light mb-6 tracking-tight">
              Beranda <span className="italic">Guru</span>
            </h1>
            <p className="text-stone-500 max-w-xl mx-auto text-lg">
              Pusat alat bantu administrasi dan pembelajaran untuk guru PAUD/TK yang modern dan efisien.
            </p>
          </header>
        )}

        <AnimatePresence mode="wait">
          {!showAsesmenMenu && !showAbsensiMenu && !showSuratMenu && !showAdminMenu ? (
            <motion.div 
              key="main-menu"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {mainMenuItems.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ y: -5 }}
                  onClick={item.action}
                  className={`text-left p-6 md:p-7 rounded-[1.75rem] border transition-all duration-300 group relative overflow-hidden shadow-lg shadow-stone-200/50 hover:shadow-xl cursor-pointer ${item.color}`}
                >
                  <div className="mb-5 bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm">
                    {item.icon}
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${item.textColor}`}>
                    {item.title}
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed mb-6">
                    {item.description}
                  </p>
                  <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform ${item.textColor.replace('900', '700')}`}>
                    MASUK APLIKASI <ArrowRight size={16} />
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : showAdminMenu ? (
            <motion.div 
              key="admin-menu"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-4xl mx-auto"
            >
              <div className="relative mb-12 text-center">
                <button 
                  onClick={() => setShowAdminMenu(false)}
                  className="absolute left-0 top-0 p-2 rounded-full hover:bg-stone-200 transition-colors"
                  title="Kembali"
                >
                  <ArrowLeft size={24} className="text-stone-600" />
                </button>
                <h2 className="text-3xl md:text-4xl font-serif mb-3">
                  Menu <span className="text-stone-600 italic">Admin</span>
                </h2>
                <p className="text-stone-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                  Kelola data master, kurikulum, dan pengaturan sistem untuk operasional sekolah yang lebih baik.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
                {adminItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onNavigate(item.id)}
                    className={`text-left p-6 md:p-7 rounded-[2rem] border transition-all duration-300 group relative overflow-hidden ${item.color} cursor-pointer shadow-sm hover:shadow-md w-full`}
                  >
                    <div className="mb-5 bg-white w-12 h-12 rounded-xl flex items-center justify-center shadow-sm">
                      {item.icon}
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${item.textColor}`}>
                      {item.title}
                    </h3>
                    <p className="text-stone-600 text-xs md:text-sm leading-relaxed mb-6">
                      {item.description}
                    </p>
                    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform ${item.textColor.replace('900', '600')}`}>
                      BUKA MENU <ArrowRight size={14} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : showAsesmenMenu ? (
            <motion.div 
              key="asesmen-menu"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-4xl mx-auto"
            >
              <div className="relative mb-12 text-center">
                <button 
                  onClick={() => setShowAsesmenMenu(false)}
                  className="absolute left-0 top-0 p-2 rounded-full hover:bg-stone-200 transition-colors"
                  title="Kembali"
                >
                  <ArrowLeft size={24} className="text-stone-600" />
                </button>
                <h2 className="text-3xl md:text-4xl font-serif mb-3">
                  Menu <span className="text-blue-600 italic">Asesmen</span>
                </h2>
                <p className="text-stone-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                  Pilih jenis instrumen penilaian yang ingin Anda gunakan untuk mendokumentasikan perkembangan anak.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
                {asesmenItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onNavigate(item.id)}
                    className={`text-left p-6 md:p-7 rounded-[2rem] border transition-all duration-300 group relative overflow-hidden ${item.color} cursor-pointer shadow-sm hover:shadow-md`}
                  >
                    <div className="mb-5 bg-white w-12 h-12 rounded-xl flex items-center justify-center shadow-sm">
                      {item.icon}
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${item.textColor}`}>
                      {item.title}
                    </h3>
                    <p className="text-stone-600 text-xs md:text-sm leading-relaxed mb-6">
                      {item.description}
                    </p>
                    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform ${item.textColor.replace('900', '600')}`}>
                      BUKA INSTRUMEN <ArrowRight size={14} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : showSuratMenu ? (
            <motion.div 
              key="surat-menu"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-4xl mx-auto"
            >
              <div className="relative mb-12 text-center">
                <button 
                  onClick={() => setShowSuratMenu(false)}
                  className="absolute left-0 top-0 p-2 rounded-full hover:bg-stone-200 transition-colors"
                  title="Kembali"
                >
                  <ArrowLeft size={24} className="text-stone-600" />
                </button>
                <h2 className="text-3xl md:text-4xl font-serif mb-3">
                  Menu <span className="text-pink-600 italic">Surat</span>
                </h2>
                <p className="text-stone-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                  Manajemen administrasi surat menyurat sekolah untuk dokumentasi yang lebih rapi.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
                {suratItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onNavigate(item.id)}
                    className={`text-left p-6 md:p-7 rounded-[2rem] border transition-all duration-300 group relative overflow-hidden ${item.color} cursor-pointer shadow-sm hover:shadow-md`}
                  >
                    <div className="mb-5 bg-white w-12 h-12 rounded-xl flex items-center justify-center shadow-sm">
                      {item.icon}
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${item.textColor}`}>
                      {item.title}
                    </h3>
                    <p className="text-stone-600 text-xs md:text-sm leading-relaxed mb-6">
                      {item.description}
                    </p>
                    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform ${item.textColor.replace('900', '600')}`}>
                      BUKA ARSIP <ArrowRight size={14} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="absensi-menu"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-4xl mx-auto"
            >
              <div className="relative mb-12 text-center">
                <button 
                  onClick={() => setShowAbsensiMenu(false)}
                  className="absolute left-0 top-0 p-2 rounded-full hover:bg-stone-200 transition-colors"
                  title="Kembali"
                >
                  <ArrowLeft size={24} className="text-stone-600" />
                </button>
                <h2 className="text-3xl md:text-4xl font-serif mb-3">
                  Menu <span className="text-cyan-600 italic">Absensi</span>
                </h2>
                <p className="text-stone-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                  Manajemen kehadiran harian untuk memastikan kedisiplinan dan rekapitulasi data yang akurat.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
                {absensiItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onNavigate(item.id)}
                    className={`text-left p-6 md:p-7 rounded-[2rem] border transition-all duration-300 group relative overflow-hidden ${item.color} cursor-pointer shadow-sm hover:shadow-md`}
                  >
                    <div className="mb-5 bg-white w-12 h-12 rounded-xl flex items-center justify-center shadow-sm">
                      {item.icon}
                    </div>
                    <h3 className={`text-lg font-bold mb-2 ${item.textColor}`}>
                      {item.title}
                    </h3>
                    <p className="text-stone-600 text-xs md:text-sm leading-relaxed mb-6">
                      {item.description}
                    </p>
                    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform ${item.textColor.replace('900', '600')}`}>
                      BUKA ABSENSI <ArrowRight size={14} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-16 text-center text-stone-400 text-xs font-medium uppercase tracking-widest">
          &copy; 2026 Education Platform • Versi 1.0.0
        </footer>
      </div>
    </div>
  );
}
