import React from 'react';
import { Construction, Sparkles, Clock, Mail } from 'lucide-react';
import { motion } from 'motion/react';

export default function MaintenanceMode() {
  return (
    <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-amber-200 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, -90, 0],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-indigo-200 rounded-full blur-[100px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl shadow-amber-900/5 p-8 md:p-16 border border-white relative z-10 text-center"
      >
        {/* Icon Header */}
        <div className="relative inline-block mb-12">
          <div className="w-24 h-24 bg-amber-50 rounded-[2rem] flex items-center justify-center text-amber-600 shadow-inner">
            <Construction size={48} />
          </div>
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 15, -15, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-indigo-500"
          >
            <Sparkles size={24} />
          </motion.div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-6 leading-tight">
          Aplikasi Dalam <span className="italic text-amber-600 underline decoration-amber-200 underline-offset-8">Pemeliharaan</span>
        </h1>
        
        <p className="text-stone-500 text-lg mb-12 leading-relaxed max-w-lg mx-auto">
          Mohon maaf atas ketidaknyamanannya. Saat ini kami sedang melakukan pembaruan sistem untuk memberikan pengalaman yang lebih baik bagi Anda.
        </p>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100 flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-amber-600">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Estimasi Selesai</p>
              <p className="font-bold text-stone-700">Segera Kembali</p>
            </div>
          </div>
          <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100 flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600">
              <Mail size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Hubungi Kami</p>
              <p className="font-bold text-stone-700">nurimanps0@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-stone-100">
          <p className="text-stone-400 text-xs font-medium uppercase tracking-[0.2em]">
            Terima kasih atas kesabaran Anda
          </p>
        </div>
      </motion.div>
    </div>
  );
}
