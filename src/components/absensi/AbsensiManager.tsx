import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  School, 
  UserCog, 
  ClipboardCheck, 
  FileText, 
  ChevronLeft,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Beranda from './Beranda';
import DataKelas from './DataKelas';
import DataSiswa from './DataSiswa';
import PakarData from './PakarData';
import InputAbsensi from './InputAbsensi';
import LaporanAbsensi from './LaporanAbsensi';

interface AbsensiManagerProps {
  onBack: () => void;
}

type SubMenu = 'beranda' | 'data-kelas' | 'data-siswa' | 'pakar-data' | 'absensi' | 'laporan';

export default function AbsensiManager({ onBack }: AbsensiManagerProps) {
  const [activeMenu, setActiveMenu] = useState<SubMenu>('beranda');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'beranda', title: 'Beranda', icon: <LayoutDashboard size={20} /> },
    { id: 'data-kelas', title: 'Data Kelas', icon: <School size={20} /> },
    { id: 'data-siswa', title: 'Data Siswa', icon: <Users size={20} /> },
    { id: 'pakar-data', title: 'Pakar Data (Guru)', icon: <UserCog size={20} /> },
    { id: 'absensi', title: 'Absensi Guru/Siswa', icon: <ClipboardCheck size={20} /> },
    { id: 'laporan', title: 'Laporan', icon: <FileText size={20} /> },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'beranda': return <Beranda />;
      case 'data-kelas': return <DataKelas />;
      case 'data-siswa': return <DataSiswa />;
      case 'pakar-data': return <PakarData />;
      case 'absensi': return <InputAbsensi />;
      case 'laporan': return <LaporanAbsensi />;
      default: return <Beranda />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F5F2ED] overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-white border-r border-stone-200 flex flex-col shadow-xl z-20"
      >
        <div className="p-6 flex items-center justify-between border-bottom border-stone-100">
          {isSidebarOpen && (
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-serif text-xl font-bold text-cyan-700"
            >
              Modul <span className="italic">Absensi</span>
            </motion.h2>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id as SubMenu)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                activeMenu === item.id 
                  ? 'bg-cyan-50 text-cyan-700 font-bold shadow-sm' 
                  : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
              }`}
            >
              <span className={`${activeMenu === item.id ? 'text-cyan-600' : 'text-stone-400'}`}>
                {item.icon}
              </span>
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm"
                >
                  {item.title}
                </motion.span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-stone-100">
          <button
            onClick={onBack}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-rose-600 hover:bg-rose-50 transition-all duration-200"
          >
            <ChevronLeft size={20} />
            {isSidebarOpen && <span className="text-sm font-bold">Kembali ke Menu Utama</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 p-6 flex items-center justify-between z-10">
          <h1 className="text-2xl font-serif font-bold text-stone-800 capitalize">
            {activeMenu.replace('-', ' ')}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Tanggal Hari Ini</p>
              <p className="text-sm font-bold text-stone-700">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMenu}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
