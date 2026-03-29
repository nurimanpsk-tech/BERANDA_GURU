import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { ppmService } from '../services/ppmService';
import { generatePPMPDF, PPMData } from '../services/pdfService';
import { History, Download, ArrowLeft, Loader2, FileText, Search, Trash2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PPMHistoryProps {
  onBack: () => void;
  onSelect: (data: PPMData) => void;
  user: User | null;
}

export default function PPMHistory({ onBack, onSelect, user }: PPMHistoryProps) {
  const [ppms, setPpms] = useState<PPMData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPpms = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const data = await ppmService.getAllPPM(user.id);
        setPpms(data);
      } catch (err) {
        console.error('Failed to fetch PPMs:', err);
        setError('Gagal mengambil data dari cloud. Periksa koneksi atau konfigurasi Supabase.');
      } finally {
        setLoading(false);
      }
    };
    fetchPpms();
  }, [user]);

  const filteredPpms = ppms.filter(ppm => 
    ppm.informasiUmum.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ppm.informasiUmum.subTema.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = (ppm: PPMData) => {
    generatePPMPDF(ppm);
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 text-center relative">
          <button 
            onClick={onBack}
            className="absolute left-0 top-0 p-2 rounded-full hover:bg-stone-200 transition-colors"
            title="Kembali ke Menu PPM"
          >
            <ArrowLeft size={24} className="text-stone-600" />
          </button>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-4"
          >
            <History size={14} />
            Cloud Storage
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-serif font-light mb-4 tracking-tight">
            Riwayat PPM
          </h1>
          <p className="text-stone-500 max-w-xl mx-auto">
            Daftar seluruh Perencanaan Pembelajaran Mendalam (PPM) yang telah Anda buat dan tersimpan di cloud.
          </p>
        </header>

        <div className="mb-8 relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
          <input
            type="text"
            placeholder="Cari tema atau sub-tema..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-2xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all shadow-sm"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-amber-600 mb-4" size={48} />
            <p className="text-stone-500 font-medium">Mengambil data dari cloud...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 text-red-800 p-8 rounded-3xl text-center max-w-2xl mx-auto">
            <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
            <h3 className="text-xl font-bold mb-2">Terjadi Kesalahan</h3>
            <p className="mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : filteredPpms.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-stone-300">
            <FileText className="mx-auto mb-4 text-stone-300" size={64} />
            <h3 className="text-xl font-serif text-stone-400">Belum ada PPM yang tersimpan</h3>
            <p className="text-stone-400 mt-2">Mulai buat PPM baru di menu Generator.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredPpms.map((ppm, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-white rounded-3xl shadow-lg shadow-stone-200/50 border border-stone-100 overflow-hidden hover:border-amber-200 transition-all flex flex-col"
                >
                  <div className="p-6 flex-grow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest bg-stone-50 px-2 py-1 rounded-md">
                        {ppm.informasiUmum.usia}
                      </span>
                    </div>
                    <h3 className="text-xl font-serif mb-1 line-clamp-1">{ppm.informasiUmum.tema}</h3>
                    <p className="text-stone-500 text-sm mb-4 line-clamp-2">{ppm.informasiUmum.subTema}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-stone-400">
                        <span className="font-bold uppercase tracking-tighter">Minggu:</span>
                        <span>{ppm.informasiUmum.mingguSemester}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-400">
                        <span className="font-bold uppercase tracking-tighter">Tanggal:</span>
                        <span>{ppm.informasiUmum.hariTanggal}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center gap-2">
                    <button
                      onClick={() => onSelect(ppm)}
                      className="flex-grow bg-white text-stone-700 border border-stone-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-stone-100 transition-colors flex items-center justify-center gap-2"
                    >
                      Buka & Edit
                    </button>
                    <button
                      onClick={() => handleDownload(ppm)}
                      className="bg-amber-600 text-white p-2 rounded-xl hover:bg-amber-700 transition-colors shadow-lg shadow-amber-600/20"
                      title="Unduh PDF"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <footer className="mt-12 text-center text-stone-400 text-xs font-medium uppercase tracking-widest">
          &copy; 2026 PPM AI Generator • Crafted for Teachers
        </footer>
      </div>
    </div>
  );
}
