import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PPMData {
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
  doc.setFont('helvetica', 'bold');
  doc.text('PERENCANAAN PEMBELAJARAN MENDALAM', 148.5, 15, { align: 'center' });
  doc.text(schoolName, 148.5, 22, { align: 'center' });
  doc.text(academicYear, 148.5, 29, { align: 'center' });

  // 12pt gap after title (12pt ≈ 4.23mm)
  let currentY = 29 + 4.23;
  doc.setLineHeightFactor(1.15); // Reduced to 1.15 for more compact line spacing within cells

  const getDayData = (dayName: string, type: 'penyambutan' | 'kegiatan') => {
    const day = data.pengalamanBelajar.jadwalHarian.find(j => j.hari.toLowerCase().includes(dayName.toLowerCase()));
    if (type === 'penyambutan') return day?.kegiatanPenyambutan || 'Penyambutan';
    
    const inti = data.pengalamanBelajar.kegiatanInti.find(k => k.hari.toLowerCase().includes(dayName.toLowerCase()));
    return inti?.kegiatan.map(k => `• ${k}`).join('\n') || '-';
  };

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
        styledLabel: 'Instrumen asesmen',
        content: '\n\n' + [
          data.asesmenAwal.deskripsi,
          ...data.asesmenAwal.poinPoin.map((p) => `       -  ${p}`),
          ...data.asesmenAwal.instrumen.map((i) => `       -  ${i}`),
        ].join('\n'),
      },
    ],
    // IDENTIFIKASI
    [
      { content: 'IDENTIFIKASI', styles: { fontStyle: 'bold' as const, valign: 'middle' as const } },
      {
        colSpan: 5,
        styledLabel: 'Dimensi Profil Lulusan (Profil Pelajar Pancasila Anak Usia Dini)',
        content: '\n\n' + data.identifikasi.dimensiProfilLulusan.map((d) => `       -  ${d}`).join('\n'),
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
        styledLabel: 'Tujuan Pembelajaran',
        content: '\n\n' + data.desainPembelajaran.tujuanPembelajaran.map((t) => `       -  ${t}`).join('\n'),
      },
    ],
    [
      { content: '', styles: { lineWidth: 0 }, isCustomMerged: true },
      {
        colSpan: 5,
        styledLabel: 'Praktik Pedagogis',
        content: '\n\n' + data.desainPembelajaran.praktikPedagogis.map((p) => `       -  ${p}`).join('\n'),
      },
    ],
    [
      { content: '', styles: { lineWidth: 0 }, isCustomMerged: true },
      {
        colSpan: 5,
        styledLabel: 'Kemitraan Pembelajaran',
        content: '\n\n' + [
          '   Orang Tua',
          ...data.desainPembelajaran.kemitraan.orangTua.map((o) => `       -  ${o}`),
          '\n   Lingkungan Sekolah',
          ...data.desainPembelajaran.kemitraan.lingkunganSekolah.map((l) => `       -  ${l}`),
          '\n   Lingkungan Pembelajaran',
          ...data.desainPembelajaran.kemitraan.lingkunganPembelajaran.map((lp) => `       -  ${lp}`),
        ].join('\n'),
      },
    ],
    [
      { content: '', styles: { lineWidth: 0 }, isCustomMerged: true, isLast: true },
      {
        colSpan: 5,
        styledLabel: 'Pemanfaatan Digital',
        content: '\n\n' + data.desainPembelajaran.pemanfaatanDigital.map((pd) => `       -  ${pd}`).join('\n'),
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
        styledLabel: 'Penyambutan',
        content: '\n\n' + data.pengalamanBelajar.penyambutan,
      },
    ],
    [
      { content: '', styles: { lineWidth: 0 }, isCustomMerged: true },
      { content: 'SENIN', styles: { fontStyle: 'bold' as const, halign: 'center' as const, fillColor: [197, 224, 179], cellPadding: { top: 0.8, bottom: 0.8 } } },
      { content: 'SELASA', styles: { fontStyle: 'bold' as const, halign: 'center' as const, fillColor: [197, 224, 179], cellPadding: { top: 0.8, bottom: 0.8 } } },
      { content: 'RABU', styles: { fontStyle: 'bold' as const, halign: 'center' as const, fillColor: [197, 224, 179], cellPadding: { top: 0.8, bottom: 0.8 } } },
      { content: 'KAMIS', styles: { fontStyle: 'bold' as const, halign: 'center' as const, fillColor: [197, 224, 179], cellPadding: { top: 0.8, bottom: 0.8 } } },
      { content: 'JUMAT', styles: { fontStyle: 'bold' as const, halign: 'center' as const, fillColor: [197, 224, 179], cellPadding: { top: 0.8, bottom: 0.8 } } },
    ],
    [
      { content: '', styles: { lineWidth: 0 }, isCustomMerged: true },
      { content: 'ROSSA', styles: { fontStyle: 'italic' as const, halign: 'center' as const, fillColor: [255, 242, 204], cellPadding: { top: 0.8, bottom: 0.8 } } },
      { content: 'ROSSA', styles: { fontStyle: 'italic' as const, halign: 'center' as const, fillColor: [255, 242, 204], cellPadding: { top: 0.8, bottom: 0.8 } } },
      { content: 'ROSSA', styles: { fontStyle: 'italic' as const, halign: 'center' as const, fillColor: [255, 242, 204], cellPadding: { top: 0.8, bottom: 0.8 } } },
      { content: 'ROSSA', styles: { fontStyle: 'italic' as const, halign: 'center' as const, fillColor: [255, 242, 204], cellPadding: { top: 0.8, bottom: 0.8 } } },
      { content: 'ROSSA', styles: { fontStyle: 'italic' as const, halign: 'center' as const, fillColor: [255, 242, 204], cellPadding: { top: 0.8, bottom: 0.8 } } },
    ],
    [
      { content: '', styles: { lineWidth: 0 }, isCustomMerged: true },
      { content: getDayData('Senin', 'penyambutan'), styles: { halign: 'center' as const, fontStyle: 'italic' as const } },
      { content: getDayData('Selasa', 'penyambutan'), styles: { halign: 'center' as const, fontStyle: 'italic' as const } },
      { content: getDayData('Rabu', 'penyambutan'), styles: { halign: 'center' as const, fontStyle: 'italic' as const } },
      { content: getDayData('Kamis', 'penyambutan'), styles: { halign: 'center' as const, fontStyle: 'italic' as const } },
      { content: getDayData('Jumat', 'penyambutan'), styles: { halign: 'center' as const, fontStyle: 'italic' as const } },
    ],
    [
      { content: '', styles: { lineWidth: 0 }, isCustomMerged: true },
      {
        colSpan: 5,
        content: [
          '',
          '', // Spacer for Pembukaaan
          ...data.pengalamanBelajar.pembukaan.map((p) => `       -  ${p}`),
          '',
          '', // Spacer for Memahami
          ...data.pengalamanBelajar.memahami.map((m, i) => `       ${i + 1}. ${m}`),
        ].join('\n'),
        isMultiStyledLabel: true,
        styledLabels: [
          { text: 'Pembukaaan', line: 1 },
          { text: 'Memahami', line: 3 + data.pengalamanBelajar.pembukaan.length }
        ]
      },
    ],
    [
      { content: '', styles: { lineWidth: 0 }, isCustomMerged: true },
      { colSpan: 5, content: 'KEGIATAN INTI', styles: { fontStyle: 'bolditalic' as const, halign: 'left' as const, fillColor: [255, 255, 255], cellPadding: { top: 1.2, bottom: 1.2, left: 2.5 } }, isUnderlinedHeader: true },
    ],
    [
      { content: '', styles: { lineWidth: 0 }, isCustomMerged: true },
      { content: 'SENIN', styles: { fontStyle: 'bold' as const, halign: 'center' as const, fillColor: [244, 176, 131], cellPadding: { top: 0.8, bottom: 0.8 } } },
      { content: 'SELASA', styles: { fontStyle: 'bold' as const, halign: 'center' as const, fillColor: [244, 176, 131], cellPadding: { top: 0.8, bottom: 0.8 } } },
      { content: 'RABU', styles: { fontStyle: 'bold' as const, halign: 'center' as const, fillColor: [244, 176, 131], cellPadding: { top: 0.8, bottom: 0.8 } } },
      { content: 'KAMIS', styles: { fontStyle: 'bold' as const, halign: 'center' as const, fillColor: [244, 176, 131], cellPadding: { top: 0.8, bottom: 0.8 } } },
      { content: 'JUMAT', styles: { fontStyle: 'bold' as const, halign: 'center' as const, fillColor: [244, 176, 131], cellPadding: { top: 0.8, bottom: 0.8 } } },
    ],
    [
      { content: '', styles: { lineWidth: 0 }, isCustomMerged: true },
      { content: getDayData('Senin', 'kegiatan') },
      { content: getDayData('Selasa', 'kegiatan') },
      { content: getDayData('Rabu', 'kegiatan') },
      { content: getDayData('Kamis', 'kegiatan') },
      { content: getDayData('Jumat', 'kegiatan') },
    ],
    [
      { content: '', styles: { lineWidth: 0 }, isCustomMerged: true, isLast: true },
      {
        colSpan: 5,
        content: [
          '',
          '', // Spacer for Mengaplikasi
          ...data.pengalamanBelajar.mengaplikasi.map((a) => `       -  ${a}`),
          '',
          '', // Spacer for Merefleksi
          ...data.pengalamanBelajar.merefleksi.map((r) => `       -  ${r}`),
          '',
          '', // Spacer for Penutup
          `   ${data.pengalamanBelajar.penutup}`,
        ].join('\n'),
        isMultiStyledLabel: true,
        styledLabels: [
          { text: 'Mengaplikasi', line: 1 },
          { text: 'Merefleksi', line: 3 + data.pengalamanBelajar.mengaplikasi.length },
          { text: 'Penutup', line: 5 + data.pengalamanBelajar.mengaplikasi.length + data.pengalamanBelajar.merefleksi.length }
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
      fontSize: 10.5,
      cellPadding: { top: 1.2, bottom: 1.2, left: 2.5, right: 2.5 },
      valign: 'middle' as const,
      lineColor: [0, 0, 0],
      lineWidth: 0.2, // Slightly thicker lines for a cleaner look
      textColor: [0, 0, 0],
      overflow: 'linebreak',
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
    didDrawPage: (dataHook) => {
      // Draw continuous vertical borders for the first column on each page
      if (col0MinY !== 0) {
        doc.setDrawColor(0);
        doc.setLineWidth(0.2);
        // Vertical lines
        doc.line(col0X, col0MinY, col0X, col0MaxY);
        doc.line(col0X + col0Width, col0MinY, col0X + col0Width, col0MaxY);
        
        // Close the column at the bottom of the page if it's a page break
        // and at the top if it's a continuation
        doc.line(col0X, col0MinY, col0X + col0Width, col0MinY);
        doc.line(col0X, col0MaxY, col0X + col0Width, col0MaxY);
        
        // Reset for next page
        col0MinY = dataHook.settings.margin.top;
      }
    },
    didDrawCell: (dataHook) => {
      const { doc, cell, column } = dataHook;
      
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
          doc.setLineWidth(0.2);
          if (raw.isFirst) doc.line(cell.x, cell.y, cell.x + cell.width, cell.y);
          if (raw.isLast) doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
        }
      }

      // Draw INFORMASI UMUM content with aligned colons
      if (dataHook.section === 'body' && dataHook.cell.raw && typeof dataHook.cell.raw === 'object' && ('isInformasiUmum' in dataHook.cell.raw)) {
        const { doc, cell } = dataHook;
        const labels = ['Tema', 'Sub Tema', 'Usia', 'Minggu/ Semester', 'Alokasi waktu', 'Hari, Tanggal'];
        const values = [
          data.informasiUmum.tema,
          data.informasiUmum.subTema,
          data.informasiUmum.usia,
          data.informasiUmum.mingguSemester,
          data.informasiUmum.alokasiWaktu,
          data.informasiUmum.hariTanggal
        ];
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10.5);
        
        const startX = cell.x + 2.5;
        const colonX = cell.x + 40; // Aligned colons
        let startY = cell.y + 5;
        
        labels.forEach((label, i) => {
          doc.text(label, startX, startY);
          doc.text(`: ${values[i]}`, colonX, startY);
          startY += 5;
        });
      }

      // Draw underline for headers
      if (dataHook.section === 'body' && dataHook.cell.raw && typeof dataHook.cell.raw === 'object' && ('isUnderlinedHeader' in dataHook.cell.raw)) {
        const { doc, cell } = dataHook;
        doc.setFont('helvetica', 'bolditalic');
        doc.setFontSize(cell.styles.fontSize || 10.5);
        const text = cell.text.join(' ');
        const textWidth = doc.getTextWidth(text);
        doc.setDrawColor(0);
        doc.setLineWidth(0.2);
        // Use the exact padding defined in the cell styles
        const paddingLeft = 2.5; 
        doc.line(cell.x + paddingLeft, cell.y + cell.height - 1.5, cell.x + paddingLeft + textWidth, cell.y + cell.height - 1.5);
      }

      // Draw styled labels within cells
      if (dataHook.section === 'body' && dataHook.cell.raw && typeof dataHook.cell.raw === 'object') {
        const raw = dataHook.cell.raw as any;
        const { doc, cell } = dataHook;
        const paddingLeft = 2.5;
        const paddingTop = 1.2;
        const lineHeight = 5; // Approximate line height in mm

        if ('styledLabel' in raw) {
          doc.setFont('helvetica', 'bolditalic');
          doc.setFontSize(cell.styles.fontSize || 10.5);
          const textWidth = doc.getTextWidth(raw.styledLabel);
          const yPos = cell.y + paddingTop + 3.5; // Adjusted for first line
          doc.text(raw.styledLabel, cell.x + paddingLeft, yPos);
          doc.setDrawColor(0);
          doc.setLineWidth(0.2);
          doc.line(cell.x + paddingLeft, yPos + 0.5, cell.x + paddingLeft + textWidth, yPos + 0.5);
        }

        if ('isMultiStyledLabel' in raw && 'styledLabels' in raw) {
          doc.setFont('helvetica', 'bolditalic');
          doc.setFontSize(cell.styles.fontSize || 10.5);
          raw.styledLabels.forEach((label: any) => {
            const textWidth = doc.getTextWidth(label.text);
            const yPos = cell.y + paddingTop + 3.5 + (label.line * lineHeight);
            doc.text(label.text, cell.x + paddingLeft, yPos);
            doc.setDrawColor(0);
            doc.setLineWidth(0.2);
            doc.line(cell.x + paddingLeft, yPos + 0.5, cell.x + paddingLeft + textWidth, yPos + 0.5);
          });
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
  doc.text('Mengetahui', 60, finalY, { align: 'center' });
  doc.text('Kepala Sekolah', 60, finalY + 4, { align: 'center' });
  doc.text(data.principalName || 'KUNLISTYANI, S.Pd', 60, finalY + 22, { align: 'center' });

  doc.text('Guru Kelas B', 230, finalY + 4, { align: 'center' });
  doc.text(data.teacherName || 'NABILA ANIN SAU\'DAH', 230, finalY + 22, { align: 'center' });

  doc.save(`PPM_${data.informasiUmum.tema.replace(/\s+/g, '_')}.pdf`);
};
