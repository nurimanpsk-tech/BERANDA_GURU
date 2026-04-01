import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Trash2, Calendar, User as UserIcon, BookOpen, CheckSquare, Palette, Image as ImageIcon, Loader2, Download, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '@supabase/supabase-js';
import { assessmentService, AssessmentData, AssessmentType } from '../../services/assessmentService';

interface AssessmentHistoryProps {
  onBack: () => void;
  user: User | null;
}

export default function AssessmentHistory({ onBack, user }: AssessmentHistoryProps) {
  const [assessments, setAssessments] = useState<AssessmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<AssessmentType | 'all'>('all');

  useEffect(() => {
    fetchAssessments();
  }, [user]);

  const fetchAssessments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await assessmentService.getAssessments(user.id);
      setAssessments(data);
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus riwayat ini?')) return;
    try {
      await assessmentService.deleteAssessment(id);
      setAssessments(assessments.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting assessment:', error);
      alert('Gagal menghapus riwayat.');
    }
  };

  const filteredAssessments = assessments.filter(a => {
    const matchesSearch = 
      a.data.tema?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.data.subTema?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.data.schoolName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || a.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: AssessmentType) => {
    switch (type) {
      case 'ceklis': return <CheckSquare className="text-blue-600" size={20} />;
      case 'anekdot': return <BookOpen className="text-emerald-600" size={20} />;
      case 'hasil_karya': return <Palette className="text-orange-600" size={20} />;
      case 'foto_berseri': return <ImageIcon className="text-rose-600" size={20} />;
    }
  };

  const getTypeName = (type: AssessmentType) => {
    switch (type) {
      case 'ceklis': return 'Ceklis';
      case 'anekdot': return 'Anekdot';
      case 'hasil_karya': return 'Hasil Karya';
      case 'foto_berseri': return 'Foto Berseri';
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center relative">
          <button 
            onClick={onBack}
            className="absolute left-0 top-0 p-2 rounded-full hover:bg-stone-200 transition-colors"
          >
            <ArrowLeft size={24} className="text-stone-600" />
          </button>
          <h1 className="text-3xl font-serif font-bold text-stone-800">Riwayat Asesmen</h1>
          <p className="text-stone-500 mt-2">Daftar asesmen yang telah Anda simpan</p>
        </header>

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input 
              type="text"
              placeholder="Cari tema, sub tema, atau sekolah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                filterType === 'all'
                  ? 'bg-stone-800 text-white border-stone-800'
                  : 'bg-stone-50 text-stone-500 border-stone-200 hover:border-stone-300'
              }`}
            >
              Semua
            </button>
            {(['ceklis', 'anekdot', 'hasil_karya', 'foto_berseri'] as AssessmentType[]).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                  filterType === type
                    ? 'bg-stone-800 text-white border-stone-800'
                    : 'bg-stone-50 text-stone-500 border-stone-200 hover:border-stone-300'
                }`}
              >
                {getTypeName(type)}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p>Memuat riwayat...</p>
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-stone-200 p-12 text-center text-stone-400">
            <Calendar size={48} className="mx-auto mb-4 opacity-20" />
            <p>Tidak ada riwayat ditemukan.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredAssessments.map((assessment) => (
                <motion.div
                  key={assessment.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 group hover:border-blue-200 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="bg-stone-50 p-3 rounded-xl h-fit">
                        {getTypeIcon(assessment.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                            {getTypeName(assessment.type)}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-stone-300" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                            {assessment.data.group}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-stone-800 leading-tight mb-1">
                          {assessment.data.tema}
                        </h3>
                        <p className="text-stone-500 text-sm mb-3">
                          {assessment.data.subTema}
                        </p>
                        
                        <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs text-stone-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {new Date(assessment.created_at!).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <UserIcon size={14} />
                            {assessment.data.schoolName}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDelete(assessment.id!)}
                        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Hapus"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
