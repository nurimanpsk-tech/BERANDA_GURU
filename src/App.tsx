import React, { useState, useEffect } from 'react';
import { ArrowLeft, LogOut, User as UserIcon, Lock } from 'lucide-react';
import Home from './components/home/Home';
import PPMGenerator from './components/ppm/PPMGenerator';
import PPMMenu from './components/ppm/PPMMenu';
import PPMHistory from './components/ppm/PPMHistory';
import AnekdotGenerator from './components/asesmen/AnekdotGenerator';
import CeklisGenerator from './components/asesmen/CeklisGenerator';
import HasilKaryaGenerator from './components/asesmen/HasilKaryaGenerator';
import FotoBerseriGenerator from './components/asesmen/FotoBerseriGenerator';
import AssessmentHistory from './components/asesmen/AssessmentHistory';
import JurnalGuru from './components/jurnal/JurnalGuru';
import JurnalKS from './components/jurnal/JurnalKS';
import ClassManager from './components/kelas/ClassManager';
import SchoolManager from './components/settings/SchoolManager';
import AnnouncementGenerator from './components/announcement/AnnouncementGenerator';
import CurriculumManager from './components/admin/CurriculumManager';
import UserManager from './components/admin/UserManager';
import AbsensiManager from './components/absensi/AbsensiManager';
import AbsensiSiswa from './components/absensi/AbsensiSiswa';
import AbsensiGuru from './components/absensi/AbsensiGuru';
import Auth from './components/auth/Auth';
import Settings from './components/settings/Settings';
import MaintenanceMode from './components/MaintenanceMode';
import { PPMData } from './services/pdfService';
import { ppmService } from './services/ppmService';
import { appSettingsService } from './services/appSettingsService';
import { getSupabase } from './services/supabaseClient';
import { User } from '@supabase/supabase-js';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [ppmData, setPpmData] = useState<PPMData | null>(null);
  const [returnToAsesmen, setReturnToAsesmen] = useState(false);
  const [returnToAbsensi, setReturnToAbsensi] = useState(false);
  const [returnToAdmin, setReturnToAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [checkingMaintenance, setCheckingMaintenance] = useState(true);

  const supabase = getSupabase();

  // Handle browser/hardware back button and Auth
  useEffect(() => {
    // Check Maintenance Mode
    const checkMaintenance = async () => {
      try {
        const isMaintenance = await appSettingsService.getMaintenanceMode();
        setMaintenanceMode(isMaintenance);
      } catch (err) {
        console.error('Failed to check maintenance mode:', err);
      } finally {
        setCheckingMaintenance(false);
      }
    };
    checkMaintenance();

    // Auth Check
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          fetchProfile(currentUser.id);
        } else {
          setAuthLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      setAuthLoading(false);
    }
  }, [supabase]);

  const fetchProfile = async (userId: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        // Fallback to user_metadata if profile table doesn't exist yet or error
        setProfile({ role: user?.user_metadata?.role || 'user' });
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setPpmData(null);
      return;
    }

    // Load latest PPM from Supabase
    const loadPPM = async () => {
      try {
        const latest = await ppmService.getLatestPPM(user.id);
        if (latest) setPpmData(latest);
      } catch (err) {
        console.error('Failed to load PPM from Supabase:', err);
      }
    };
    loadPPM();

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.page) {
        setCurrentPage(event.state.page);
        // Reset sub-menu flags when going back to home via system button
        if (event.state.page === 'home') {
          setReturnToAsesmen(false);
          setReturnToAbsensi(false);
          setReturnToAdmin(false);
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
    // Reset all sub-menu flags whenever navigating
    setReturnToAsesmen(false);
    setReturnToAbsensi(false);
    setReturnToAdmin(false);
    window.history.pushState({ page }, '');
  };

  const navigateBackToAsesmen = () => {
    setCurrentPage('home');
    setReturnToAsesmen(true);
    setReturnToAbsensi(false);
    setReturnToAdmin(false);
    window.history.pushState({ page: 'home' }, '');
  };

  const navigateBackToAbsensi = () => {
    setCurrentPage('home');
    setReturnToAsesmen(false);
    setReturnToAbsensi(true);
    setReturnToAdmin(false);
    window.history.pushState({ page: 'home' }, '');
  };

  const isAdmin = user?.user_metadata?.role === 'admin' || profile?.role === 'admin' || user?.email === 'nurimanpsk@gmail.com';

  const handleMaintenanceToggle = (enabled: boolean) => {
    setMaintenanceMode(enabled);
  };

  const navigateBackToAdmin = () => {
    setCurrentPage('home');
    setReturnToAsesmen(false);
    setReturnToAbsensi(false);
    setReturnToAdmin(false);
    window.history.pushState({ page: 'home' }, '');
  };

  const handlePPMGenerated = (data: PPMData) => {
    setPpmData(data);
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setCurrentPage('home');
    }
  };

  if (authLoading || checkingMaintenance || (user && !profile)) {
    return (
      <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-stone-500 font-medium">Menyiapkan Sistem...</p>
        </div>
      </div>
    );
  }

  // Show maintenance mode if enabled and user is NOT an admin
  if (maintenanceMode && !isAdmin) {
    return <MaintenanceMode />;
  }

  if (!supabase) {
    return (
      <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-amber-200 text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-800 mb-4">Konfigurasi Diperlukan</h2>
          <p className="text-stone-600 mb-6 leading-relaxed">
            Sistem otentikasi (Login) belum aktif karena <strong>VITE_SUPABASE_URL</strong> dan <strong>VITE_SUPABASE_ANON_KEY</strong> belum dikonfigurasi di environment variables.
          </p>
          <div className="bg-stone-50 rounded-xl p-4 text-left text-sm font-mono text-stone-500 mb-6 break-all">
            Silakan tambahkan variabel tersebut di platform deployment Anda (Vercel/Netlify/Cloud Run) agar menu login muncul.
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-amber-600 text-white font-bold py-3 rounded-xl hover:bg-amber-700 transition-all"
          >
            Muat Ulang Halaman
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

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
          initialShowAdmin={returnToAdmin}
          user={user}
          profile={profile}
          isAdmin={isAdmin}
        />
      )}
      {currentPage === 'curriculum' && (
        <CurriculumManager onBack={navigateBackToAdmin} user={user} />
      )}
      {currentPage === 'users' && (
        <UserManager onBack={navigateBackToAdmin} currentUser={user} />
      )}
      {currentPage === 'ppm' && (
        <PPMMenu 
          onBack={() => navigateTo('home')} 
          onSelectCreate={() => navigateTo('ppm-generator')}
          onSelectHistory={() => navigateTo('ppm-history')}
        />
      )}
      {currentPage === 'ppm-generator' && (
        <PPMGenerator 
          onBack={() => navigateTo('ppm')} 
          onGenerate={handlePPMGenerated}
          initialData={ppmData}
          user={user}
        />
      )}
      {currentPage === 'ppm-history' && (
        <PPMHistory 
          onBack={() => navigateTo('ppm')} 
          onSelect={(data) => {
            setPpmData(data);
            navigateTo('ppm-generator');
          }}
          user={user}
        />
      )}
      {currentPage === 'anekdot' && (
        <AnekdotGenerator 
          onBack={navigateBackToAsesmen} 
          ppmData={currentPpmData}
          user={user}
        />
      )}
      {currentPage === 'ceklist' && (
        <CeklisGenerator 
          onBack={navigateBackToAsesmen} 
          ppmData={currentPpmData}
          user={user}
        />
      )}
      {currentPage === 'hasilkarya' && (
        <HasilKaryaGenerator 
          onBack={navigateBackToAsesmen} 
          ppmData={currentPpmData}
          user={user}
        />
      )}
      {currentPage === 'foto-berseri' && (
        <FotoBerseriGenerator 
          onBack={navigateBackToAsesmen} 
          ppmData={currentPpmData}
          user={user}
        />
      )}
      {currentPage === 'asesmen-history' && (
        <AssessmentHistory 
          onBack={navigateBackToAsesmen} 
          user={user}
        />
      )}
      {currentPage === 'jurnal-guru' && (
        <JurnalGuru onBack={() => navigateTo('home')} />
      )}
      {currentPage === 'jurnal-ks' && (
        <JurnalKS onBack={() => navigateTo('home')} />
      )}
      {currentPage === 'data-kelas' && (
        <ClassManager onBack={() => navigateTo('pengaturan')} user={user} />
      )}
      {currentPage === 'data-sekolah' && (
        <SchoolManager onBack={() => navigateTo('pengaturan')} user={user} />
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
      {currentPage === 'absensi' && (
        <AbsensiManager onBack={() => navigateTo('home')} />
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
        <Settings 
          onBack={() => navigateTo('home')} 
          user={user}
          profile={profile}
          onLogout={handleLogout}
          onNavigate={navigateTo}
          isAdmin={isAdmin}
          maintenanceMode={maintenanceMode}
          onMaintenanceToggle={handleMaintenanceToggle}
        />
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
