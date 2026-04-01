import React from 'react';
import { ArrowLeft, UserCircle } from 'lucide-react';

interface JurnalKSProps {
  onBack: () => void;
}

export default function JurnalKS({ onBack }: JurnalKSProps) {
  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center relative">
          <button 
            onClick={onBack}
            className="absolute left-0 top-0 p-2 rounded-full hover:bg-stone-200 transition-colors"
            title="Kembali"
          >
            <ArrowLeft size={24} className="text-stone-600" />
          </button>
          <h1 className="text-4xl font-serif mb-4">Jurnal Kepala Sekolah</h1>
          <p className="text-stone-500 text-lg">Fitur ini sedang dalam pengembangan.</p>
        </header>
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-stone-100">
          <UserCircle size={64} className="mx-auto mb-6 text-stone-200" />
          <p className="text-stone-500 text-lg">Halaman Jurnal Kepala Sekolah akan segera hadir.</p>
        </div>
      </div>
    </div>
  );
}
