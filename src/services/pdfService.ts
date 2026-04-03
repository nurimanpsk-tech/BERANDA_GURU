import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

export const generatePPMPDF = (data: PPMData) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const schoolName = data.schoolName || 'TK BALEGONDO 1';
  const academicYear = data.academicYear || 'TAHUN PELAJARAN 2025/2026';

  // Header
  doc.setFontSize(12);
  doc.setFont('times', 'bold');
  doc.text('PERENCANAAN PEMBELAJARAN MENDALAM', 148.5, 15, { align: 'center' });
  doc.text(schoolName, 148.5, 22, { align: 'center' });
  doc.text(academicYear, 148.5, 29, { align: 'center' });

  // 12pt gap after title (12pt ≈ 4.23mm)
  let currentY = 29 + 4.23;
  doc.setLineHeightFactor(1.15); // Reduced to 1.15 for more compact line spacing within cells
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);

  const getDayData = (dayName: string, type: 'penyambutan' | 'kegiatan' | 'memahami') => {
    const day = dayName.toLowerCase();
    if (type === 'penyambutan') return (data.penyambutan as any)?.[day] || 'Penyambutan';
    if (type === 'memahami') return (data.kegiatanHarian as any)?.[day] || '-';
    
    const inti = (data.kegiatanInti as any)?.[day];
    return Array.isArray(inti) ? inti.map(k => `• ${k}`).join('\n') : '-';
  };

  const fontSize = 10.5;

  const tableData: any[] = [
    // INFORMASI UMUM
    [
      { content: 'INFORMASI\nUMUM', styles: { fontStyle: 'bold' as const, valign: 'middle' as const } },
      {
        colSpan: 5,
        content: '', // Drawn manually in didDrawCell for alignment
        isInformasiUmum: true,
        styles: { minCellHeight: 32 }
      },
    ],
    // ASESMEN AWAL
    [
      { content: 'ASESMEN AWAL', styles: { fontStyle: 'bold' as const, valign: 'middle' as const } },
      {
        colSpan: 5,
        content: [
          'Instrumen asesmen',
          '',
          data.asesmenAwal.deskripsi,
          ...data.asesmenAwal.poinPoin.map((p) => `- ${p}`),
          ...data.asesmenAwal.instrumen.map((i) => `- ${i}`),
        ].join('\n'),
        styles: { valign: 'top' as const },
      },
    ],
    // IDENTIFIKASI
    [
      { content: 'IDENTIFIKASI', styles: { fontStyle: 'bold' as const, valign: 'middle' as const } },
      {
        colSpan: 5,
        content: [
          'Dimensi Profil Lulusan (Profil Pelajar Pancasila Anak Usia Dini)',
          '',
          ...data.identifikasi.dimensiProfilLulusan.map((d) => `- ${d}`)
        ].join('\n'),
        styles: { valign: 'top' as const },
      },
    ],
    // DESAIN PEMBELAJARAN (Simulated Merge)
    [
      { 
        content: 'DESAIN\nPEMBELAJARAN', 
        styles: { fontStyle: 'bold' as const, valign: 'top' as const, lineWidth: 0 },
        isCustomMerged: true,
        isFirst: true
      },
      {
        colSpan: 5,
        content: [
          'Tujuan Pembelajaran',
          '',
          ...data.desainPembelajaran.tujuanPembelajaran.map((t) => `- ${t}`)
        ].join('\n'),
        styles: { valign: 'top' as const },
      },
    ],
    [
      { content: '', styles: { lineWidth: 0 }, isCustomMerged: true },
      {
        colSpan: 5,
        content: [
          'Praktik Pedagogis',
          '',
          ...data.desainPembelajaran.praktikPedagogis.map((p) => `- ${p}`)
        ].join('\n'),
        styles: { valign: 'top' as const },
      },
    ],
    [
      { content: '', styles: { lineWidth: 0 }, isCustomMerged: true },
      {
        colSpan: 5,
        content: [
          'Kemitraan Pembelajaran',
          '',
          '   Orang Tua',
          '',
          ...data.desainPembelajaran.kemitraan.orangTua.map((o) => `- ${o}`),
          '',
          '   Lingkungan Sekolah',
          '',
          ...data.desainPembelajaran.kemitraan.lingkunganSekolah.map((l) => `- ${l}`),
          '',
          '   Lingkungan Pembelajaran',
          '',
          ...data.desainPembelajaran.kemitraan.lingkunganPembelajaran.map((lp) => `- ${lp}`),
        ].join('\n'),
        styles: { valign: 'top' as const },
      },
    ],
    [
      { content: '', styles: { lineWidth: 0 }, isCustomMerged: true, isLast: true },
      {
        colSpan: 5,
        content: [
          'Pemanfaatan Digital',
          '',
          ...data.desainPembelajaran.pemanfaatanDigital.map((pd) => `- ${pd}`)
        ].join('\n'),
        styles: { valign: 'top' as const },
      },
    ],
    // PENGALAMAN BELAJAR (Simulated Merge)
    [
      { 
        content: 'PENGALAMAN\nBELAJAR', 
        styles: { fontStyle: 'bold' as const, valign: 'top' as const, lineWidth: 0 },
        isCustomMerged: true,
        isFirst: true
      },
      {
        colSpan: 5,
        content: [
          'Penyambutan',
          '',
          'Penyambutan anak dengan sapaan hangat dan senyum'
        ].join('\n'),
        styles: { valign: 'top' as const },
      },
    ],
    [
      { content: '', styles: { lineWidth: 0 }, isCustomMerged: true },
      { content: 'SENIN', styles: { fontStyle: 'bold' as const, halign: 'center' as const, fillColor: [218, 233, 247], cellPadding: { top: 0.8, bottom: 0.8 } } },
      { content: 'SELASA', styles: { fontStyle: 'bold' as const, halign: 'center' as const, fillColor: [218, 233, 247], cellPadding: { top: 0.8, bottom: 0.8 } } },
      { content: 'RABU', styles: { fontStyle: 'bold' as const, halign: 'center' as const, fillColor: [218, 233, 247], cellPadding: { top: 0.8, bottom: 0.8 } } },
      { content: 'KAMIS', styles: { fontStyle: 'bold' as const, halign: 'center' as const, fillColor: [218, 233, 247], cellPadding: { top: 0.8, bottom: 0.8 } } },
      { content: 'JUMAT', styles: { fontStyle: 'bold' as const, halign: 'center' as const, fillColor: [218, 233, 247], cellPadding: { top: 0.8, bottom: 0.8 } } },
    ],
    [
      { content: '', styles: { lineWidth: 0 }, isCustomMerged: true },
      { content: 'Guru', styles: { fontStyle: 'italic' as const, halign: 'center' as const, fillColor: [255, 242, 204], cellPadding: { top: 0.8, bottom: 0.8 } } },
      { content: 'Guru', styles: { fontStyle: 'italic' as const, halign: 'center' as const, fillColor: [255, 242, 204], cellPadding: { top: 0.8, bottom: 0.8 } } },
      { content: 'Guru', styles: { fontStyle: 'italic' as const, halign: 'center' as const, fillColor: [255, 242, 204], cellPadding: { top: 0.8, bottom: 0.8 } } },
      { content: 'Guru', styles: { fontStyle: 'italic' as const, halign: 'center' as const, fillColor: [255, 242, 204], cellPadding: { top: 0.8, bottom: 0.8 } } },
      { content: 'Guru', styles: { fontStyle: 'italic' as const, halign: 'center' as const, fillColor: [255, 242, 204], cellPadding: { top: 0.8, bottom: 0.8 } } },
    ],
    [
      { content: '', styles: { lineWidth: 0 }, isCustomMerged: true },
      { content: getDayData('senin', 'penyambutan'), styles: { halign: 'center' as const, fontStyle: 'italic' as const } },
      { content: getDayData('selasa', 'penyambutan'), styles: { halign: 'center' as const, fontStyle: 'italic' as const } },
      { content: getDayData('rabu', 'penyambutan'), styles: { halign: 'center' as const, fontStyle: 'italic' as const } },
      { content: getDayData('kamis', 'penyambutan'), styles: { halign: 'center' as const, fontStyle: 'italic' as const } },
      { content: getDayData('jumat', 'penyambutan'), styles: { halign: 'center' as const, fontStyle: 'italic' as const } },
    ],
    [
      { content: '', styles: { lineWidth: 0 }, isCustomMerged: true },
      {
        colSpan: 5,
        content: [
          'Pembukaan',
          '',
          ...(data.pembukaan || []).map((p) => `- ${p}`),
        ].join('\n'),
        styles: { valign: 'top' as const },
      },
    ],
    [
      { content: '', styles: { lineWidth: 0 }, isCustomMerged: true },
      {
        colSpan: 5,
        content: [
          'Memahami',
          '',
          ...(data.pengalamanBelajar.memahami || []).map((m, i) => `${i + 1}. ${m}`),
        ].join('\n'),
        styles: { valign: 'top' as const },
      },
    ],
    [
      { content: '', styles: { lineWidth: 0 }, isCustomMerged: true },
      { colSpan: 5, content: 'KEGIATAN INTI', styles: { fontStyle: 'bolditalic' as const, halign: 'left' as const, fillColor: [255, 255, 255], cellPadding: { top: 1.2, bottom: 1.2, left: 2.5 } }, isUnderlinedHeader: true },
    ],
    [
      { content: '', styles: { lineWidth: 0 }, isCustomMerged: true },
      { content: 'SENIN', styles: { fontStyle: 'bold' as const, halign: 'center' as const, fillColor: [218, 233, 247], cellPadding: { top: 0.8, bottom: 0.8 } } },
      { content: 'SELASA', styles: { fontStyle: 'bold' as const, halign: 'center' as const, fillColor: [218, 233, 247], cellPadding: { top: 0.8, bottom: 0.8 } } },
      { content: 'RABU', styles: { fontStyle: 'bold' as const, halign: 'center' as const, fillColor: [218, 233, 247], cellPadding: { top: 0.8, bottom: 0.8 } } },
      { content: 'KAMIS', styles: { fontStyle: 'bold' as const, halign: 'center' as const, fillColor: [218, 233, 247], cellPadding: { top: 0.8, bottom: 0.8 } } },
      { content: 'JUMAT', styles: { fontStyle: 'bold' as const, halign: 'center' as const, fillColor: [218, 233, 247], cellPadding: { top: 0.8, bottom: 0.8 } } },
    ],
    [
      { content: '', styles: { lineWidth: 0 }, isCustomMerged: true },
      { content: getDayData('senin', 'kegiatan'), styles: { valign: 'top' as const, cellPadding: { top: 1.2, bottom: 1.2, left: 2.5, right: 2.5 } } },
      { content: getDayData('selasa', 'kegiatan'), styles: { valign: 'top' as const, cellPadding: { top: 1.2, bottom: 1.2, left: 2.5, right: 2.5 } } },
      { content: getDayData('rabu', 'kegiatan'), styles: { valign: 'top' as const, cellPadding: { top: 1.2, bottom: 1.2, left: 2.5, right: 2.5 } } },
      { content: getDayData('kamis', 'kegiatan'), styles: { valign: 'top' as const, cellPadding: { top: 1.2, bottom: 1.2, left: 2.5, right: 2.5 } } },
      { content: getDayData('jumat', 'kegiatan'), styles: { valign: 'top' as const, cellPadding: { top: 1.2, bottom: 1.2, left: 2.5, right: 2.5 } } },
    ],
    [
      { content: '', styles: { lineWidth: 0 }, isCustomMerged: true, isLast: true },
      {
        colSpan: 5,
        content: [
          'Mengaplikasi',
          '',
          ...(data.mengaplikasi || []).map((a) => `- ${a}`),
          '',
          'Merefleksi',
          '',
          ...(data.merefleksi || []).map((r) => `- ${r}`),
          '',
          'Penutup',
          '',
          '   Berdoa, salam, dan pulang bersama-sama.',
        ].join('\n'),
        isMultiStyledLabel: true,
        styles: { valign: 'top' as const },
        styledLabels: [
          { text: 'Mengaplikasi', line: 0 },
          { text: 'Merefleksi', line: 2 + (data.mengaplikasi || []).length + 1 },
          { text: 'Penutup', line: 2 + (data.mengaplikasi || []).length + 1 + 2 + (data.merefleksi || []).length + 1 }
        ]
      },
    ],
    // ASESMEN PEMBELAJARAN
    [
      { content: 'ASESMEN\nPEMBELAJARAN', styles: { fontStyle: 'bold' as const, valign: 'middle' as const } },
      { colSpan: 5, content: data.asesmenPembelajaran },
    ],
  ];

  // Variables for tracking column 0 borders across pages to ensure continuity
  let col0MinY = 0;
  let col0MaxY = 0;
  let col0X = 0;
  let col0Width = 0;

  autoTable(doc, {
    startY: currentY,
    head: [],
    body: tableData,
    theme: 'grid',
    styles: {
      font: 'times',
      fontSize: 10.5,
      cellPadding: { top: 1.2, bottom: 1.2, left: 2.5, right: 2.5 },
      valign: 'middle' as const,
      lineColor: [0, 0, 0],
      lineWidth: 0.3, // Standard thickness
      textColor: [0, 0, 0],
      overflow: 'linebreak',
    },
    bodyStyles: {
      font: 'times',
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 45.4 },
      2: { cellWidth: 45.4 },
      3: { cellWidth: 45.4 },
      4: { cellWidth: 45.4 },
      5: { cellWidth: 45.4 },
    },
    margin: { top: 12, bottom: 12, left: 12, right: 12 },
    pageBreak: 'auto',
    rowPageBreak: 'avoid',
    didParseCell: (data) => {
      // No manual text hiding
    },
    didDrawPage: (dataHook) => {
      // Reset for next page
      col0MinY = dataHook.settings.margin.top;
    },
    didDrawCell: (dataHook) => {
      const { doc, cell, column } = dataHook;
      
      // Ensure borders are black and standard thickness for any manual drawing
      doc.setDrawColor(0);
      doc.setLineWidth(0.3);

      // Implement isInformasiUmum drawing
      if (cell.raw && typeof cell.raw === 'object' && ('isInformasiUmum' in cell.raw)) {
        const info = data.informasiUmum;
        
        doc.setTextColor(0, 0, 0);
        doc.setFont('times', 'bold');
        doc.text('Tema', cell.x + 2, cell.y + 5);
        doc.text('Sub Tema', cell.x + 2, cell.y + 10);
        doc.text('Usia', cell.x + 2, cell.y + 15);
        
        doc.text(':', cell.x + 35, cell.y + 5);
        doc.text(':', cell.x + 35, cell.y + 10);
        doc.text(':', cell.x + 35, cell.y + 15);
        
        doc.setFont('times', 'normal');
        doc.text(info.tema || '-', cell.x + 38, cell.y + 5);
        doc.text(info.subTema || '-', cell.x + 38, cell.y + 10);
        doc.text(info.usia || '-', cell.x + 38, cell.y + 15);
        
        doc.setFont('times', 'bold');
        doc.text('Minggu / Semester', cell.x + 110, cell.y + 5);
        doc.text('Alokasi Waktu', cell.x + 110, cell.y + 10);
        doc.text('Hari, Tanggal', cell.x + 110, cell.y + 15);
        
        doc.text(':', cell.x + 150, cell.y + 5);
        doc.text(':', cell.x + 150, cell.y + 10);
        doc.text(':', cell.x + 150, cell.y + 15);
        
        doc.setFont('times', 'normal');
        doc.text(info.mingguSemester || '-', cell.x + 153, cell.y + 5);
        doc.text(info.alokasiWaktu || '-', cell.x + 153, cell.y + 10);
        doc.text(info.hariTanggal || '-', cell.x + 153, cell.y + 15);
      }

      // Implement isUnderlinedHeader drawing
      if (cell.raw && typeof cell.raw === 'object' && ('isUnderlinedHeader' in cell.raw)) {
        // Standard autoTable border is enough, but if we want a specific underline:
        // doc.setDrawColor(0);
        // doc.setLineWidth(0.3);
        // doc.line(cell.x + 2.5, cell.y + cell.height - 1, cell.x + 35, cell.y + cell.height - 1);
      }

      // Implement isMultiStyledLabel drawing
      if (cell.raw && typeof cell.raw === 'object' && ('isMultiStyledLabel' in cell.raw)) {
        const raw = cell.raw as any;
        if (raw.styledLabels) {
          doc.setFont('times', 'bold');
          raw.styledLabels.forEach((label: any) => {
            const yPos = cell.y + (label.line * (doc.getFontSize() * 0.4)) + 5; // Approximate line height
            doc.text(label.text, cell.x + 2.5, yPos);
          });
        }
      }

      // Track column 0 boundaries for manual border drawing to ensure continuity across page breaks
      if (dataHook.section === 'body' && column.index === 0) {
        if (col0MinY === 0 || cell.y < col0MinY) col0MinY = cell.y;
        col0MaxY = cell.y + cell.height;
        col0X = cell.x;
        col0Width = cell.width;

        // For merged sections, we handle horizontal lines manually
        if (cell.raw && typeof cell.raw === 'object' && ('isCustomMerged' in cell.raw)) {
          const raw = cell.raw as any;
          doc.setDrawColor(0);
          doc.setLineWidth(0.3);
          if (raw.isFirst) doc.line(cell.x, cell.y, cell.x + cell.width, cell.y);
          if (raw.isLast) doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
        }
      }
    },
  });

  // Signatures
  let finalY = (doc as any).lastAutoTable.finalY + 15; // Increased from 5 to 15
  const pageHeight = doc.internal.pageSize.height;
  const requiredSpace = 40; // Increased space needed for signatures to account for the larger gap

  if (finalY + requiredSpace > pageHeight) {
    doc.addPage();
    finalY = 15; // Start at top of new page
  }

  doc.setFontSize(10);
  doc.setFont('times', 'normal');
  doc.text('Mengetahui', 60, finalY, { align: 'center' });
  doc.text('Kepala Sekolah', 60, finalY + 4, { align: 'center' });
  doc.setFont('times', 'bold');
  doc.text(data.principalName || 'KUNLISTYANI, S.Pd', 60, finalY + 22, { align: 'center' });

  doc.setFont('times', 'normal');
  doc.text('Guru Kelas B', 230, finalY + 4, { align: 'center' });
  doc.setFont('times', 'bold');
  doc.text(data.teacherName || 'NABILA ANIN SAU\'DAH', 230, finalY + 22, { align: 'center' });

  doc.save(`PPM_${data.informasiUmum.tema.replace(/\s+/g, '_')}.pdf`);
};
