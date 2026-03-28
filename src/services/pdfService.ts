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
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);

  const getDayData = (dayName: string, type: 'penyambutan' | 'kegiatan' | 'memahami') => {
    const day = data.pengalamanBelajar.jadwalHarian.find(j => j.hari.toLowerCase().includes(dayName.toLowerCase()));
    if (type === 'penyambutan') return day?.kegiatanPenyambutan || 'Penyambutan';
    if (type === 'memahami') return day?.kegiatan || '-';
    
    const inti = data.pengalamanBelajar.kegiatanInti.find(k => k.hari.toLowerCase().includes(dayName.toLowerCase()));
    return inti?.kegiatan.map(k => `• ${k}`).join('\n') || '-';
  };

  // Calculate max lines for Memahami table to reserve space
  const colWidth = 45.4; // 227 / 5
  const padding = 5; // 2.5 * 2
  const innerWidth = colWidth - padding;
  
  let maxMemahamiLines = 0;
  ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].forEach(dayName => {
    const text = getDayData(dayName, 'memahami');
    const lines = doc.splitTextToSize(text, innerWidth).length;
    if (lines > maxMemahamiLines) maxMemahamiLines = lines;
  });

  const fontSize = 10.5;
  const lineHeight = (fontSize * 1.15) * 0.352778;
  const initialOffset = (fontSize * 0.8) * 0.352778;

  // Memahami text height
  const memahamiText = [
    'Memahami',
    '',
    ...data.pengalamanBelajar.memahami.map((m, i) => `       ${i + 1}. ${m}`),
  ].join('\n');
  const memahamiTextLines = doc.splitTextToSize(memahamiText, 227 - 5).length;
  const memahamiTextHeight = (memahamiTextLines * lineHeight) + 2.4; // 1.2 * 2 padding

  // Table height
  const tableHeaderHeight = lineHeight + 1.6; // 0.8 * 2 padding
  const tableDataHeight = (maxMemahamiLines * lineHeight) + 2.4; // 1.2 * 2 padding
  const totalMemahamiHeight = memahamiTextHeight + tableHeaderHeight + tableDataHeight + 1; // 1mm gap after text

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
          ...data.asesmenAwal.poinPoin.map((p) => `       -  ${p}`),
          ...data.asesmenAwal.instrumen.map((i) => `       -  ${i}`),
        ].join('\n'),
        isMultiStyledLabel: true,
        styles: { valign: 'top' as const },
        styledLabels: [{ text: 'Instrumen asesmen', line: 0 }]
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
          ...data.identifikasi.dimensiProfilLulusan.map((d) => `       -  ${d}`)
        ].join('\n'),
        isMultiStyledLabel: true,
        styles: { valign: 'top' as const },
        styledLabels: [{ text: 'Dimensi Profil Lulusan (Profil Pelajar Pancasila Anak Usia Dini)', line: 0 }]
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
          ...data.desainPembelajaran.tujuanPembelajaran.map((t) => `       -  ${t}`)
        ].join('\n'),
        isMultiStyledLabel: true,
        styles: { valign: 'top' as const },
        styledLabels: [{ text: 'Tujuan Pembelajaran', line: 0 }]
      },
    ],
    [
      { content: '', styles: { lineWidth: 0 }, isCustomMerged: true },
      {
        colSpan: 5,
        content: [
          'Praktik Pedagogis',
          '',
          ...data.desainPembelajaran.praktikPedagogis.map((p) => `       -  ${p}`)
        ].join('\n'),
        isMultiStyledLabel: true,
        styles: { valign: 'top' as const },
        styledLabels: [{ text: 'Praktik Pedagogis', line: 0 }]
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
          ...data.desainPembelajaran.kemitraan.orangTua.map((o) => `       -  ${o}`),
          '',
          '   Lingkungan Sekolah',
          '',
          ...data.desainPembelajaran.kemitraan.lingkunganSekolah.map((l) => `       -  ${l}`),
          '',
          '   Lingkungan Pembelajaran',
          '',
          ...data.desainPembelajaran.kemitraan.lingkunganPembelajaran.map((lp) => `       -  ${lp}`),
        ].join('\n'),
        isMultiStyledLabel: true,
        styles: { valign: 'top' as const },
        styledLabels: [
          { text: 'Kemitraan Pembelajaran', line: 0 },
          { text: '   Orang Tua', line: 2, isSubLabel: true },
          { text: '   Lingkungan Sekolah', line: 4 + data.desainPembelajaran.kemitraan.orangTua.length + 1, isSubLabel: true },
          { text: '   Lingkungan Pembelajaran', line: 4 + data.desainPembelajaran.kemitraan.orangTua.length + 1 + 3 + data.desainPembelajaran.kemitraan.lingkunganSekolah.length, isSubLabel: true }
        ]
      },
    ],
    [
      { content: '', styles: { lineWidth: 0 }, isCustomMerged: true, isLast: true },
      {
        colSpan: 5,
        content: [
          'Pemanfaatan Digital',
          '',
          ...data.desainPembelajaran.pemanfaatanDigital.map((pd) => `       -  ${pd}`)
        ].join('\n'),
        isMultiStyledLabel: true,
        styles: { valign: 'top' as const },
        styledLabels: [{ text: 'Pemanfaatan Digital', line: 0 }]
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
          data.pengalamanBelajar.penyambutan
        ].join('\n'),
        isMultiStyledLabel: true,
        styles: { valign: 'top' as const },
        styledLabels: [{ text: 'Penyambutan', line: 0 }]
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
          'Pembukaan',
          '',
          ...data.pengalamanBelajar.pembukaan.map((p) => `       -  ${p}`),
        ].join('\n'),
        isMultiStyledLabel: true,
        styles: { valign: 'top' as const },
        styledLabels: [
          { text: 'Pembukaan', line: 0 },
        ]
      },
    ],
    [
      { content: '', styles: { lineWidth: 0 }, isCustomMerged: true },
      {
        colSpan: 5,
        content: '', // Drawn manually in didDrawCell
        isMemahamiSection: true,
        styles: { minCellHeight: totalMemahamiHeight, valign: 'top' as const },
        memahamiTextHeight,
        tableHeaderHeight,
        tableDataHeight
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
      { content: getDayData('Senin', 'kegiatan'), styles: { valign: 'top' as const, cellPadding: { top: 1.2, bottom: 1.2, left: 2.5, right: 2.5 } } },
      { content: getDayData('Selasa', 'kegiatan'), styles: { valign: 'top' as const, cellPadding: { top: 1.2, bottom: 1.2, left: 2.5, right: 2.5 } } },
      { content: getDayData('Rabu', 'kegiatan'), styles: { valign: 'top' as const, cellPadding: { top: 1.2, bottom: 1.2, left: 2.5, right: 2.5 } } },
      { content: getDayData('Kamis', 'kegiatan'), styles: { valign: 'top' as const, cellPadding: { top: 1.2, bottom: 1.2, left: 2.5, right: 2.5 } } },
      { content: getDayData('Jumat', 'kegiatan'), styles: { valign: 'top' as const, cellPadding: { top: 1.2, bottom: 1.2, left: 2.5, right: 2.5 } } },
    ],
    [
      { content: '', styles: { lineWidth: 0 }, isCustomMerged: true, isLast: true },
      {
        colSpan: 5,
        content: [
          'Mengaplikasi',
          '',
          ...data.pengalamanBelajar.mengaplikasi.map((a) => `       -  ${a}`),
          '',
          'Merefleksi',
          '',
          ...data.pengalamanBelajar.merefleksi.map((r) => `       -  ${r}`),
          '',
          'Penutup',
          '',
          `   ${data.pengalamanBelajar.penutup}`,
        ].join('\n'),
        isMultiStyledLabel: true,
        styles: { valign: 'top' as const },
        styledLabels: [
          { text: 'Mengaplikasi', line: 0 },
          { text: 'Merefleksi', line: 2 + data.pengalamanBelajar.mengaplikasi.length + 1 },
          { text: 'Penutup', line: 2 + data.pengalamanBelajar.mengaplikasi.length + 1 + 2 + data.pengalamanBelajar.merefleksi.length + 1 }
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
      lineWidth: 0.3, // Standard thickness
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
    rowPageBreak: 'avoid',
    didParseCell: (data) => {
      // Hide autotable text for cells we draw manually to avoid double drawing
      // and prevent the need for clearing rectangles that can cause double borders
      if (data.cell.raw && typeof data.cell.raw === 'object' && ('isMultiStyledLabel' in data.cell.raw)) {
        data.cell.styles.textColor = [255, 255, 255];
      }
    },
    didDrawPage: (dataHook) => {
      // Draw continuous vertical borders for the first column on each page
      if (col0MinY !== 0) {
        doc.setDrawColor(0);
        doc.setLineWidth(0.3);
        // Vertical lines - only left side, right side is handled by column 1
        doc.line(col0X, col0MinY, col0X, col0MaxY);
        
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
      
      // Ensure borders are black and standard thickness for any manual drawing
      doc.setDrawColor(0);
      doc.setLineWidth(0.3);

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
        const paddingLeft = 2.5;
        const paddingTop = 1.2;
        const fontSize = cell.styles.fontSize || 10.5;
        const initialOffset = (fontSize * 0.8) * 0.352778;
        
        doc.setFont('helvetica', 'bolditalic');
        doc.setFontSize(fontSize);
        const text = cell.text.join(' ');
        const textWidth = doc.getTextWidth(text);
        doc.setDrawColor(0);
        doc.setLineWidth(0.3);
        // Draw underline closer to text
        doc.line(cell.x + paddingLeft, cell.y + paddingTop + initialOffset + 1.0, cell.x + paddingLeft + textWidth, cell.y + paddingTop + initialOffset + 1.0);
      }

      // Draw Memahami section with its nested table
      if (dataHook.section === 'body' && dataHook.cell.raw && typeof dataHook.cell.raw === 'object' && ('isMemahamiSection' in dataHook.cell.raw)) {
        const raw = dataHook.cell.raw as any;
        const { doc, cell } = dataHook;
        const paddingLeft = 2.5;
        const paddingTop = 1.2;
        const fontSize = 10.5;
        const lineHeight = (fontSize * 1.15) * 0.352778;
        const initialOffset = (fontSize * 0.8) * 0.352778;

        // 1. Draw "Memahami" text
        doc.setFont('helvetica', 'bolditalic');
        doc.setFontSize(fontSize);
        doc.setTextColor(0, 0, 0);
        doc.text('Memahami', cell.x + paddingLeft, cell.y + paddingTop + initialOffset);
        
        // Underline for "Memahami"
        const headerWidth = doc.getTextWidth('Memahami');
        doc.setDrawColor(0);
        doc.setLineWidth(0.3);
        doc.line(cell.x + paddingLeft, cell.y + paddingTop + initialOffset + 1.0, cell.x + paddingLeft + headerWidth, cell.y + paddingTop + initialOffset + 1.0);
        
        let currentY = cell.y + paddingTop + lineHeight + 2;
        doc.setFont('helvetica', 'normal');
        data.pengalamanBelajar.memahami.forEach((m, i) => {
          const text = `       ${i + 1}. ${m}`;
          const wrapped = doc.splitTextToSize(text, cell.width - paddingLeft * 2);
          wrapped.forEach((line: string) => {
            doc.text(line, cell.x + paddingLeft, currentY + initialOffset);
            currentY += lineHeight;
          });
        });

        // 2. Draw Table Headers (Senin-Jumat)
        currentY = cell.y + raw.memahamiTextHeight + 1; // Start table after text section
        const colWidth = cell.width / 5;
        const days = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'];
        const tableHeaderHeight = raw.tableHeaderHeight;
        const tableDataHeight = raw.tableDataHeight;
        
        doc.setFont('helvetica', 'bold');
        doc.setDrawColor(0);
        doc.setLineWidth(0.3);

        // Draw header backgrounds
        days.forEach((day, i) => {
          const x = cell.x + (i * colWidth);
          doc.setFillColor(156, 195, 229); // #9CC3E5
          doc.rect(x, currentY, colWidth, tableHeaderHeight, 'F');
          doc.text(day, x + colWidth / 2, currentY + (tableHeaderHeight / 2) + (initialOffset / 2) - 0.5, { align: 'center' });
        });

        // Draw horizontal lines for the nested table
        doc.line(cell.x, currentY, cell.x + cell.width, currentY); // Top of header
        doc.line(cell.x, currentY + tableHeaderHeight, cell.x + cell.width, currentY + tableHeaderHeight); // Bottom of header / Top of data
        doc.line(cell.x, currentY + tableHeaderHeight + tableDataHeight, cell.x + cell.width, currentY + tableHeaderHeight + tableDataHeight); // Bottom of data

        // Draw vertical lines for the nested table
        // Draw all vertical lines to ensure they are thick and consistent
        for (let i = 0; i <= 5; i++) {
          const x = cell.x + (i * colWidth);
          doc.line(x, currentY, x, currentY + tableHeaderHeight + tableDataHeight);
        }

        // 3. Draw Table Data Text
        currentY += tableHeaderHeight;
        doc.setFont('helvetica', 'normal');
        days.forEach((day, i) => {
          const x = cell.x + (i * colWidth);
          const text = getDayData(day, 'memahami');
          const wrapped = doc.splitTextToSize(text, colWidth - 5);
          let textY = currentY + 1.2 + initialOffset;
          wrapped.forEach((line: string) => {
            doc.text(line, x + 2.5, textY);
            textY += lineHeight;
          });
        });
      }

      // Draw styled labels within cells
      if (dataHook.section === 'body' && dataHook.cell.raw && typeof dataHook.cell.raw === 'object') {
        const raw = dataHook.cell.raw as any;
        const { doc, cell } = dataHook;
        const paddingLeft = 2.5;
        const paddingTop = 1.2;
        const fontSize = cell.styles.fontSize || 10.5;
        const lineHeight = (fontSize * 1.15) * 0.352778;
        const initialOffset = (fontSize * 0.8) * 0.352778;

        if ('styledLabel' in raw || ('isMultiStyledLabel' in raw && 'styledLabels' in raw)) {
          const availableWidth = cell.width - (paddingLeft * 2);
          const contentLines = (raw.content || '').split('\n');
          let currentY = cell.y + paddingTop;

          doc.setTextColor(0, 0, 0); // Ensure text is black as autotable text was hidden with white
          const styledLabelsMap = new Map();
          if ('isMultiStyledLabel' in raw && 'styledLabels' in raw) {
            raw.styledLabels.forEach((l: any) => styledLabelsMap.set(l.line, l));
          } else if ('styledLabel' in raw) {
            styledLabelsMap.set(0, { text: raw.styledLabel, isMain: true });
          }

          contentLines.forEach((lineText: string, index: number) => {
            const styledLabel = styledLabelsMap.get(index);
            
            if (styledLabel) {
              doc.setFont('helvetica', styledLabel.isSubLabel ? 'bold' : 'bolditalic');
            } else {
              doc.setFont('helvetica', 'normal');
            }
            doc.setFontSize(fontSize);

            // Use splitTextToSize to handle wrapping
            const wrappedLines = doc.splitTextToSize(lineText, availableWidth);
            wrappedLines.forEach((wLine: string) => {
              const yPos = currentY + initialOffset;
              
              // Safety check for NaN
              if (!isNaN(yPos) && !isNaN(cell.x)) {
                doc.text(wLine, cell.x + paddingLeft, yPos);
                
                // Underline for main labels
                if (styledLabel && !styledLabel.isSubLabel && wLine.trim() !== '') {
                  const textWidth = doc.getTextWidth(wLine);
                  if (!isNaN(textWidth)) {
                    doc.setDrawColor(0);
                    doc.setLineWidth(0.3);
                    doc.line(cell.x + paddingLeft, yPos + 1.0, cell.x + paddingLeft + textWidth, yPos + 1.0);
                  }
                }
              }
              currentY += lineHeight;
            });
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
