export interface CurriculumEntry {
  id: string;
  user_id?: string;
  elemen: string;
  subElemen: string;
  tp: string;
  atp: string;
  indikator: string;
}

export interface PPMData {
  id?: string;
  informasiUmum: {
    tema: string;
    subTema: string;
    usia: string;
    mingguSemester: string;
    alokasiWaktu: string;
    hariTanggal: string;
  };
  asesmenAwal: {
    deskripsi: string;
    poinPoin: string[];
    instrumen: string[];
  };
  identifikasi: {
    dimensiProfilLulusan: string[];
  };
  desainPembelajaran: {
    tujuanPembelajaran: string[];
    praktikPedagogis: string[];
    kemitraan: {
      orangTua: string[];
      lingkunganSekolah: string[];
      lingkunganPembelajaran: string[];
    };
    pemanfaatanDigital: string[];
  };
  pengalamanBelajar: {
    penyambutan: string;
    jadwalHarian: { hari: string; kegiatanPenyambutan: string; kegiatan: string }[];
    pembukaan: string[];
    memahami: string[];
    kegiatanInti: { hari: string; kegiatan: string[] }[];
    mengaplikasi: string[];
    merefleksi: string[];
    penutup: string;
  };
  // New fields for the structured table format
  penyambutan?: {
    senin: string;
    selasa: string;
    rabu: string;
    kamis: string;
    jumat: string;
  };
  pembukaan?: string[];
  memahami?: string[];
  kegiatanHarian?: {
    senin: string;
    selasa: string;
    rabu: string;
    kamis: string;
    jumat: string;
  };
  kegiatanInti?: {
    senin: string[];
    selasa: string[];
    rabu: string[];
    kamis: string[];
    jumat: string[];
  };
  mengaplikasi?: string[];
  merefleksi?: string[];
  asesmenPembelajaran: string;
  schoolName?: string;
  academicYear?: string;
  principalName?: string;
  teacherName?: string;
}

export interface Student {
  id: string;
  name: string;
  nis: string;
  classId: string;
}

export interface Staff {
  id: string;
  name: string;
  nip: string;
  role: 'guru' | 'kepala_sekolah';
}

export interface AttendanceRecord {
  id: string;
  date: string;
  targetId: string; // studentId or staffId
  status: 'hadir' | 'sakit' | 'izin' | 'alfa';
  type: 'siswa' | 'guru';
}

export interface Class {
  id: string;
  name: string;
  teacherName: string;
  principalName: string;
}
