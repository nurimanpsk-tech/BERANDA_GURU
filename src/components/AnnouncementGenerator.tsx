import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Send, Copy, Check, Sparkles, Megaphone, Calendar, Clock, MapPin, Info } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface AnnouncementGeneratorProps {
  onBack: () => void;
}

export default function AnnouncementGenerator({ onBack }: AnnouncementGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [formData, setFormData] = useState({
    event: '',
    date: '',
    time: '',
    location: '',
    notes: '',
    style: 'ceria' // ceria, formal, singkat
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateAnnouncement = async () => {
    if (!formData.event) return;
    
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      
      const prompt = `
        Buatlah teks pengumuman untuk grup WhatsApp orang tua murid TK (Taman Kanak-Kanak).
        
        Detail Acara:
        - Nama Acara: ${formData.event}
        - Tanggal: ${formData.date || 'Akan diinformasikan'}
        - Waktu: ${formData.time || 'Akan diinformasikan'}
        - Lokasi: ${formData.location || 'Sekolah'}
        - Catatan Tambahan: ${formData.notes || '-'}
        - Gaya Bahasa: ${formData.style} (ceria = banyak emoji dan ramah, formal = sopan dan rapi, singkat = langsung ke poin)
        
        Format output:
        - Gunakan header yang menarik.
        - Gunakan bullet points agar mudah dibaca.
        - Tambahkan salam pembuka dan penutup yang hangat.
        - Gunakan emoji yang relevan untuk TK.
        - Pastikan teks siap disalin ke WhatsApp.
        - Jangan gunakan markdown tebal (seperti **) berlebihan, gunakan format yang didukung WhatsApp (seperti *teks* untuk tebal).
      `;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      setGeneratedText(response.text || '');
    } catch (error) {
      console.error('Error generating announcement:', error);
      setGeneratedText('Maaf, terjadi kesalahan saat membuat pengumuman. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Beranda</span>
        </button>

        <header className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles size={14} />
            AI Assistant
          </div>
          <h1 className="text-4xl font-serif mb-3">AI <span className="italic text-orange-600">Pengumuman</span></h1>
          <p className="text-stone-500">Buat pengumuman grup WhatsApp yang rapi, menarik, dan informatif dalam hitungan detik.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-stone-200"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Megaphone size={20} className="text-orange-600" />
              Detail Pengumuman
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Nama Acara / Judul *</label>
                <div className="relative">
                  <Megaphone className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                  <input 
                    type="text" 
                    name="event"
                    value={formData.event}
                    onChange={handleInputChange}
                    placeholder="Contoh: Lomba Mewarnai, Piknik Bersama"
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Tanggal</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                    <input 
                      type="text" 
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      placeholder="Senin, 20 Mei"
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Waktu</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                    <input 
                      type="text" 
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      placeholder="08.00 - Selesai"
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Lokasi</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                  <input 
                    type="text" 
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Halaman Sekolah"
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Catatan Tambahan</label>
                <div className="relative">
                  <Info className="absolute left-3 top-3 text-stone-300" size={18} />
                  <textarea 
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Contoh: Membawa krayon sendiri, memakai seragam olahraga"
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Gaya Bahasa</label>
                <select 
                  name="style"
                  value={formData.style}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none appearance-none"
                >
                  <option value="ceria">😊 Ceria & Ramah (Banyak Emoji)</option>
                  <option value="formal">👔 Formal & Sopan</option>
                  <option value="singkat">⚡ Singkat & Padat</option>
                </select>
              </div>

              <button 
                onClick={generateAnnouncement}
                disabled={loading || !formData.event}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                  loading || !formData.event 
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                    : 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-200'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Buat Pengumuman
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Result Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col h-full"
          >
            <div className="bg-stone-800 rounded-[2rem] p-6 md:p-8 shadow-xl text-white flex-grow flex flex-col min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Send size={20} className="text-orange-400" />
                  Hasil Generasi
                </h2>
                {generatedText && (
                  <button 
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs font-bold"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copied ? 'Tersalin!' : 'Salin Teks'}
                  </button>
                )}
              </div>

              <div className="flex-grow bg-white/5 rounded-2xl p-4 overflow-y-auto font-mono text-sm leading-relaxed whitespace-pre-wrap border border-white/10 custom-scrollbar">
                {generatedText ? (
                  generatedText
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-stone-500 text-center p-8">
                    <Megaphone size={48} className="mb-4 opacity-20" />
                    <p>Isi detail di sebelah kiri dan klik tombol "Buat Pengumuman" untuk melihat hasilnya di sini.</p>
                  </div>
                )}
              </div>

              {generatedText && (
                <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-start gap-3">
                  <Info size={18} className="text-orange-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-200/80 leading-relaxed">
                    Teks di atas sudah diformat khusus untuk WhatsApp. Anda bisa langsung menyalin dan menempelnya ke grup orang tua murid.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}
