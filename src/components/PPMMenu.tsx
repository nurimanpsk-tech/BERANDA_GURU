import React from 'react';
import { Sparkles, History, ArrowLeft, PlusCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface PPMMenuProps {
  onBack: () => void;
  onSelectCreate: () => void;
  onSelectHistory: () => void;
}

export default function PPMMenu({ onBack, onSelectCreate, onSelectHistory }: PPMMenuProps) {
  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center relative">
          <button 
            onClick={onBack}
            className="absolute left-0 top-0 p-2 rounded-full hover:bg-stone-200 transition-colors"
            title="Kembali ke Beranda"
          >
            <ArrowLeft size={24} className="text-stone-600" />
          </button>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-4"
          >
            <Sparkles size={14} />
            Perencanaan Pembelajaran
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-serif font-light mb-4 tracking-tight">
            Menu PPM
          </h1>
          <p className="text-stone-500 max-w-xl mx-auto">
            Kelola Perencanaan Pembelajaran Mendalam (PPM) Anda dengan mudah dan otomatis.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.button
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSelectCreate}
            className="group bg-white p-8 rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 text-left transition-all hover:border-emerald-200"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <PlusCircle size={32} />
            </div>
            <h3 className="text-2xl font-serif mb-2">Buat PPM Baru</h3>
            <p className="text-stone-500 text-sm leading-relaxed">
              Susun perencanaan pembelajaran otomatis menggunakan AI sesuai tema dan sub-tema yang Anda inginkan.
            </p>
          </motion.button>

          <motion.button
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSelectHistory}
            className="group bg-white p-8 rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 text-left transition-all hover:border-amber-200"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <History size={32} />
            </div>
            <h3 className="text-2xl font-serif mb-2">Riwayat PPM</h3>
            <p className="text-stone-500 text-sm leading-relaxed">
              Lihat, edit, atau unduh kembali PPM yang telah Anda buat sebelumnya yang tersimpan di cloud.
            </p>
          </motion.button>
        </div>

        <footer className="mt-12 text-center text-stone-400 text-xs font-medium uppercase tracking-widest">
          &copy; 2026 PPM AI Generator • Crafted for Teachers
        </footer>
      </div>
    </div>
  );
}
