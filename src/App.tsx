import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Home from './components/Home';
import PPMGenerator from './components/PPMGenerator';
import AnekdotGenerator from './components/AnekdotGenerator';
import CeklisGenerator from './components/CeklisGenerator';
import HasilKaryaGenerator from './components/HasilKaryaGenerator';
import FotoBerseriGenerator from './components/FotoBerseriGenerator';
import AnnouncementGenerator from './components/AnnouncementGenerator';
import CurriculumManager from './components/CurriculumManager';
import AbsensiSiswa from './components/AbsensiSiswa';
import AbsensiGuru from './components/AbsensiGuru';
import { PPMData } from './services/pdfService';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [ppmData, setPpmData] = useState<PPMData | null>(null);
  const [returnToAsesmen, setReturnToAsesmen] = useState(false);
  const [returnToAbsensi, setReturnToAbsensi] = useState(false);

  // Handle browser/hardware back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.page) {
        setCurrentPage(event.state.page);
        // Reset sub-menu flags when going back to home via system button
        if (event.state.page === 'home') {
          setReturnToAsesmen(false);
          setReturnToAbsensi(false);
        }
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Initial state
    if (!window.history.state) {
      window.history.replaceState({ page: 'home' }, '');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    if (page !== 'home') {
      setReturnToAsesmen(false);
      setReturnToAbsensi(false);
    }
    window.history.pushState({ page }, '');
  };

  const navigateBackToAsesmen = () => {
    setCurrentPage('home');
    setReturnToAsesmen(true);
    setReturnToAbsensi(false);
    window.history.pushState({ page: 'home' }, '');
  };

  const navigateBackToAbsensi = () => {
    setCurrentPage('home');
    setReturnToAsesmen(false);
    setReturnToAbsensi(true);
    window.history.pushState({ page: 'home' }, '');
  };

  const navigateBackToSurat = () => {
    setCurrentPage('home');
    setReturnToAsesmen(false);
    setReturnToAbsensi(false);
    // We could add a setReturnToSurat if we want it to stay open
  };

  const handlePPMGenerated = (data: PPMData) => {
    setPpmData(data);
  };

  const dummyPpmData: PPMData = {
    informasiUmum: {
      tema: 'Tanaman',
      subTema: 'Serunya Berkebun',
      usia: '5-6 Tahun (Kelompok B)',
      mingguSemester: 'Minggu ke-10 / Semester II',
      alokasiWaktu: '210 Menit per Hari',
      hariTanggal: 'Senin - Jumat / Mei 2026'
    },
    asesmenAwal: {
      deskripsi: '',
      poinPoin: [],
      instrumen: []
    },
    identifikasi: {
      dimensiProfilLulusan: []
    },
    desainPembelajaran: {
      tujuanPembelajaran: [],
      praktikPedagogis: [],
      kemitraan: {
        orangTua: [],
        lingkunganSekolah: [],
        lingkunganPembelajaran: []
      },
      pemanfaatanDigital: []
    },
    pengalamanBelajar: {
      penyambutan: '',
      jadwalHarian: [],
      pembukaan: [],
      memahami: [],
      kegiatanInti: [],
      mengaplikasi: [],
      merefleksi: [],
      penutup: ''
    },
    asesmenPembelajaran: '',
    schoolName: 'TK BALEGONDO 1',
    academicYear: '2025/2026',
    principalName: 'KUNLISTYANI, S.Pd',
    teacherName: 'NABILA ANIN SAU\'DAH'
  };

  const currentPpmData = ppmData || dummyPpmData;

  return (
    <>
      {currentPage === 'home' && (
        <Home 
          onNavigate={navigateTo} 
          hasPPMData={!!ppmData} 
          initialShowAsesmen={returnToAsesmen}
          initialShowAbsensi={returnToAbsensi}
        />
      )}
      {currentPage === 'curriculum' && (
        <CurriculumManager onBack={() => navigateTo('home')} />
      )}
      {currentPage === 'ppm' && (
        <PPMGenerator 
          onBack={() => navigateTo('home')} 
          onGenerate={handlePPMGenerated}
          initialData={ppmData}
        />
      )}
      {currentPage === 'anekdot' && (
        <AnekdotGenerator 
          onBack={navigateBackToAsesmen} 
          ppmData={currentPpmData}
        />
      )}
      {currentPage === 'ceklist' && (
        <CeklisGenerator 
          onBack={navigateBackToAsesmen} 
          ppmData={currentPpmData}
        />
      )}
      {currentPage === 'hasilkarya' && (
        <HasilKaryaGenerator 
          onBack={navigateBackToAsesmen} 
          ppmData={currentPpmData}
        />
      )}
      {currentPage === 'foto-berseri' && (
        <FotoBerseriGenerator 
          onBack={navigateBackToAsesmen} 
          ppmData={currentPpmData}
        />
      )}
      {currentPage === 'pengumuman' && (
        <AnnouncementGenerator 
          onBack={() => navigateTo('home')} 
        />
      )}
      {currentPage === 'rapot' && (
        <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <header className="mb-12 text-center relative">
              <button 
                onClick={() => navigateTo('home')}
                className="absolute left-0 top-0 p-2 rounded-full hover:bg-stone-200 transition-colors"
                title="Kembali"
              >
                <ArrowLeft size={24} className="text-stone-600" />
              </button>
              <h1 className="text-4xl font-serif mb-4">Menu Rapot</h1>
            </header>
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-stone-100">
              <p className="text-stone-500 text-lg">Fitur ini sedang dalam pengembangan.</p>
            </div>
          </div>
        </div>
      )}
      {currentPage === 'absensi-siswa' && (
        <AbsensiSiswa onBack={navigateBackToAbsensi} />
      )}
      {currentPage === 'absensi-guru' && (
        <AbsensiGuru onBack={navigateBackToAbsensi} />
      )}
      {currentPage === 'absensi-ks' && (
        <AbsensiGuru onBack={navigateBackToAbsensi} isPrincipalView={true} />
      )}
      {currentPage === 'pengaturan' && (
        <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <header className="mb-12 text-center relative">
              <button 
                onClick={() => navigateTo('home')}
                className="absolute left-0 top-0 p-2 rounded-full hover:bg-stone-200 transition-colors"
                title="Kembali"
              >
                <ArrowLeft size={24} className="text-stone-600" />
              </button>
              <h1 className="text-4xl font-serif mb-4">Pengaturan Sekolah</h1>
            </header>
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-stone-100">
              <p className="text-stone-500 text-lg">Fitur ini sedang dalam pengembangan.</p>
            </div>
          </div>
        </div>
      )}
      {currentPage === 'uang-kas' && (
        <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <header className="mb-12 text-center relative">
              <button 
                onClick={() => navigateTo('home')}
                className="absolute left-0 top-0 p-2 rounded-full hover:bg-stone-200 transition-colors"
                title="Kembali"
              >
                <ArrowLeft size={24} className="text-stone-600" />
              </button>
              <h1 className="text-4xl font-serif mb-4">Manajemen Uang Kas</h1>
            </header>
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-stone-100">
              <p className="text-stone-500 text-lg">Fitur ini sedang dalam pengembangan.</p>
            </div>
          </div>
        </div>
      )}
      {currentPage === 'buku-induk' && (
        <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <header className="mb-12 text-center relative">
              <button 
                onClick={() => navigateTo('home')}
                className="absolute left-0 top-0 p-2 rounded-full hover:bg-stone-200 transition-colors"
                title="Kembali"
              >
                <ArrowLeft size={24} className="text-stone-600" />
              </button>
              <h1 className="text-4xl font-serif mb-4">Buku Induk Siswa</h1>
            </header>
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-stone-100">
              <p className="text-stone-500 text-lg">Fitur ini sedang dalam pengembangan.</p>
            </div>
          </div>
        </div>
      )}
      {currentPage === 'surat-masuk' && (
        <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <header className="mb-12 text-center relative">
              <button 
                onClick={() => navigateTo('home')}
                className="absolute left-0 top-0 p-2 rounded-full hover:bg-stone-200 transition-colors"
                title="Kembali"
              >
                <ArrowLeft size={24} className="text-stone-600" />
              </button>
              <h1 className="text-4xl font-serif mb-4">Surat Masuk</h1>
            </header>
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-stone-100">
              <p className="text-stone-500 text-lg">Fitur ini sedang dalam pengembangan.</p>
            </div>
          </div>
        </div>
      )}
      {currentPage === 'surat-keluar' && (
        <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <header className="mb-12 text-center relative">
              <button 
                onClick={() => navigateTo('home')}
                className="absolute left-0 top-0 p-2 rounded-full hover:bg-stone-200 transition-colors"
                title="Kembali"
              >
                <ArrowLeft size={24} className="text-stone-600" />
              </button>
              <h1 className="text-4xl font-serif mb-4">Surat Keluar</h1>
            </header>
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-stone-100">
              <p className="text-stone-500 text-lg">Fitur ini sedang dalam pengembangan.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
