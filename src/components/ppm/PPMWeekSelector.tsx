import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { ppmService } from '../../services/ppmService';
import { PPMData } from '../../services/pdfService';
import { Calendar, ChevronDown, Loader2 } from 'lucide-react';

interface PPMWeekSelectorProps {
  currentPpm: PPMData | null;
  onSelect: (ppm: PPMData) => void;
  onGroupChange?: (group: 'Kelompok A' | 'Kelompok B') => void;
  user: User | null;
}

export default function PPMWeekSelector({ currentPpm, onSelect, onGroupChange, user }: PPMWeekSelectorProps) {
  const [allPpms, setAllPpms] = useState<PPMData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<'Kelompok A' | 'Kelompok B'>('Kelompok A');

  useEffect(() => {
    const fetchPpms = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const data = await ppmService.getAllPPM(user.id);
        const ppms = data.map(item => item.data);
        setAllPpms(ppms);

        // If currentPpm exists, set the group based on it
        if (currentPpm?.informasiUmum?.usia) {
          const group = currentPpm.informasiUmum.usia.includes('Kelompok A') ? 'Kelompok A' : 'Kelompok B';
          setSelectedGroup(group);
          if (onGroupChange) onGroupChange(group);
        }
      } catch (err) {
        console.error('Failed to fetch PPMs for selector:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPpms();
  }, [user, currentPpm]);

  const handleGroupSelect = (group: 'Kelompok A' | 'Kelompok B') => {
    setSelectedGroup(group);
    if (onGroupChange) onGroupChange(group);
  };

  // Filter PPMs based on selected group
  const filteredPpms = allPpms.filter(ppm => 
    ppm.informasiUmum.usia?.includes(selectedGroup)
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-stone-400 text-sm py-2 px-4 bg-white rounded-xl border border-stone-100">
        <Loader2 size={16} className="animate-spin" />
        <span>Memuat daftar minggu...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Group Selector */}
      <div className="bg-white p-1.5 rounded-2xl border border-stone-100 flex gap-1 shadow-sm">
        <button
          onClick={() => handleGroupSelect('Kelompok A')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
            selectedGroup === 'Kelompok A'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
              : 'text-stone-400 hover:bg-stone-50'
          }`}
        >
          Kelompok A
        </button>
        <button
          onClick={() => handleGroupSelect('Kelompok B')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
            selectedGroup === 'Kelompok B'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
              : 'text-stone-400 hover:bg-stone-50'
          }`}
        >
          Kelompok B
        </button>
      </div>

      {/* Week Selector */}
      <div className="relative group">
        <div className="flex items-center gap-2 mb-1.5 px-1">
          <Calendar size={14} className="text-amber-600" />
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Pilih Minggu / PPM</span>
        </div>
        <div className="relative">
          <select
            value={currentPpm ? `${currentPpm.informasiUmum.tema}_${currentPpm.informasiUmum.subTema}_${currentPpm.informasiUmum.hariTanggal}` : ''}
            onChange={(e) => {
              const selected = allPpms.find(p => `${p.informasiUmum.tema}_${p.informasiUmum.subTema}_${p.informasiUmum.hariTanggal}` === e.target.value);
              if (selected) onSelect(selected);
            }}
            className="w-full appearance-none bg-white border border-stone-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-stone-700 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all cursor-pointer shadow-sm"
          >
            <option value="" disabled>
              {filteredPpms.length > 0 ? '-- Pilih Minggu --' : `-- Tidak ada PPM ${selectedGroup} --`}
            </option>
            {filteredPpms.map((ppm, idx) => (
              <option 
                key={idx} 
                value={`${ppm.informasiUmum.tema}_${ppm.informasiUmum.subTema}_${ppm.informasiUmum.hariTanggal}`}
              >
                {ppm.informasiUmum.mingguSemester} - {ppm.informasiUmum.tema} ({ppm.informasiUmum.hariTanggal})
              </option>
            ))}
          </select>
          <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none group-hover:text-amber-500 transition-colors" />
        </div>
      </div>
    </div>
  );
}
