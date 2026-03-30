import React from 'react';
import { ArrowLeft, GraduationCap } from 'lucide-react';

interface RapotProps {
  onBack: () => void;
}

export default function Rapot({ onBack }: RapotProps) {
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
          <h1 className="text-4xl font-serif mb-4 flex items-center justify-center gap-3">
            <GraduationCap className="text-amber-600" size={40} />
            Menu Rapot
          </h1>
        </header>
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-stone-100">
          <p className="text-stone-500 text-lg">Fitur ini sedang dalam pengembangan.</p>
        </div>
      </div>
    </div>
  );
}
