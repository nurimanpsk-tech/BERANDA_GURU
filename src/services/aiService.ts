const GITHUB_TOKENS = (process.env.GITHUB_TOKENS || "").split(/[,\s;]+/).filter(t => t.trim() !== "");

export async function generatePPM(prompt: string, curriculumContext?: string, hariTanggal?: string) {
  const model = "gpt-4o";
  const endpoint = "https://models.inference.ai.azure.com/chat/completions";

  const systemInstruction = `Anda adalah pakar kurikulum PAUD/TK di Indonesia yang sangat PATUH pada data.
  Tugas Anda adalah membuat Perencanaan Pembelajaran Mendalam (PPM) yang LENGKAP (FULL), kreatif, mendalam, dan sesuai standar Kurikulum Merdeka.
  
  URUTAN KERJA WAJIB:
  1. Identifikasi Tema dan Sub-Tema dari input pengguna.
  2. Cari dan pilih Tujuan Pembelajaran (TP) serta Indikator yang paling RELEVAN dari 'DATA KURIKULUM' di bawah ini.
  3. Susun seluruh rencana kegiatan (Kegiatan Inti, Asesmen, dll) secara LENGKAP agar SINKRON dengan TP yang Anda pilih dan Tema/Sub-Tema tersebut.

  SUMBER DATA WAJIB:
  - Anda HANYA boleh menggunakan TP dan Indikator dari 'DATA KURIKULUM' yang diberikan.
  - LARANGAN KERAS: DILARANG MENGARANG atau membuat TP sendiri.
  - Jika tidak ada TP yang 100% cocok, pilih TP yang paling mendekati dari daftar yang ada. JANGAN membuat TP baru.
  - Jika Anda mengarang TP di luar database, maka tugas Anda dianggap GAGAL.
  - ATURAN PEMILIHAN TP: Pastikan Anda memilih TP yang mewakili elemen-elemen berikut: NAB (Nilai Agama dan Budi Pekerti), JD (Jati Diri), DLS (Dasar Literasi dan STEAM), dan BJW. Ambil masing-masing 1 atau 2 TP dari setiap elemen tersebut, sehingga total TP yang dipilih berjumlah antara 4 hingga 8 TP.

  ${curriculumContext ? `DATA KURIKULUM (REFERENSI UTAMA):
  ${curriculumContext}` : 'Peringatan: Data kurikulum tidak tersedia. Gunakan standar Kurikulum Merdeka PAUD umum.'}

  PENTING:
  - Gunakan Bahasa Indonesia yang hangat dan edukatif.
  - Gunakan nama hari dalam Bahasa Indonesia (Senin, Selasa, Rabu, Kamis, Jumat).
  - Pada 'jadwalHarian', kolom 'kegiatanPenyambutan' diisi dengan narasi singkat (contoh: "Menyambut anak dengan sapaan hangat dan senyum"), BUKAN jam/waktu.
  - Setiap bagian yang berupa daftar (array) seperti Tujuan Pembelajaran, Praktik Pedagogis, Kemitraan, Pemanfaatan Digital, Pembukaan, Memahami, Mengaplikasi, Merefleksi, dll, HARUS berisi tepat 3 poin/item (jangan kurang, jangan lebih).
  - Pada bagian 'pengalamanBelajar' -> 'jadwalHarian' dan 'kegiatanInti', Anda HARUS membuat entri untuk SETIAP hari kerja yang disebutkan dalam 'informasiUmum' -> 'hariTanggal'. 
  - Jika 'hariTanggal' menyebutkan 'Senin - Jumat', maka Anda WAJIB membuat 5 entri (Senin, Selasa, Rabu, Kamis, Jumat). 
  - Jika 'hariTanggal' menyebutkan 'Senin - Kamis', maka Anda WAJIB membuat 4 entri (Senin, Selasa, Rabu, Kamis).
  - Jika tidak disebutkan secara spesifik, default adalah 'Senin - Jumat' (5 hari).
  - Jika pengguna memberikan contoh kegiatan spesifik untuk hari tertentu dalam prompt mereka, Anda WAJIB menyertakan kegiatan tersebut dan melengkapinya dengan kegiatan kreatif lainnya untuk hari-hari yang tersisa dalam rentang waktu tersebut agar jadwal tetap penuh dan konsisten.
  - Setiap hari dalam 'kegiatanInti' HARUS memiliki 3 sampai 5 kegiatan yang bervariasi, kreatif, dan mendalam sesuai sub-tema.
  - Pada bagian 'identifikasi' -> 'dimensiProfilLulusan', HARUS berisi 4 sampai 5 dimensi. Sertakan contoh konkret dalam kurung untuk setiap dimensi yang HARUS selaras dan sesuai dengan 'kegiatanInti' yang Anda buat (contoh: jika ada kegiatan berkebun, maka "Mandiri (Bertanggung jawab merawat tanaman sendiri)").
  - Pastikan semua bagian terisi dengan detail namun tetap efisien agar proses cepat.
  - Anda HARUS memberikan output dalam format JSON murni sesuai skema yang diberikan.`;

  const schemaDescription = `
  Skema JSON:
  {
    "informasiUmum": {
      "tema": string,
      "subTema": string,
      "usia": string,
      "mingguSemester": string,
      "alokasiWaktu": string,
      "hariTanggal": string
    },
    "asesmenAwal": {
      "deskripsi": string,
      "poinPoin": string[],
      "instrumen": string[]
    },
    "identifikasi": {
      "dimensiProfilLulusan": string[]
    },
    "desainPembelajaran": {
      "tujuanPembelajaran": string[],
      "praktikPedagogis": string[],
      "kemitraan": {
        "orangTua": string[],
        "lingkunganSekolah": string[],
        "lingkunganPembelajaran": string[]
      },
      "pemanfaatanDigital": string[]
    },
    "pengalamanBelajar": {
      "penyambutan": string,
      "jadwalHarian": [
        { "hari": string, "kegiatanPenyambutan": string, "kegiatan": string }
      ],
      "pembukaan": string[],
      "memahami": string[],
      "kegiatanInti": [
        { "hari": string, "kegiatan": string[] }
      ],
      "mengaplikasi": string[],
      "merefleksi": string[],
      "penutup": string
    },
    "asesmenPembelajaran": string
  }`;

  const userPrompt = `Buatkan Perencanaan Pembelajaran Mendalam (PPM) kurikulum merdeka PAUD untuk tema: ${prompt}.
  Rentang waktu: ${hariTanggal || 'Senin - Jumat'}.
  
  ${schemaDescription}`;

  if (GITHUB_TOKENS.length === 0) {
    throw new Error("GITHUB_TOKENS tidak ditemukan di environment variables.");
  }

  let lastError: any = null;

  for (const token of GITHUB_TOKENS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token.trim()}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 4096
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          console.warn(`Token limit tercapai, mencoba token berikutnya...`);
          lastError = new Error(`Rate limit exceeded (429): ${JSON.stringify(errorData)}`);
          continue;
        }
        throw new Error(`GitHub Models API Error (${response.status}): ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("GitHub Models tidak memberikan respon.");
      }

      return JSON.parse(content);
    } catch (error) {
      console.error(`Error dengan token: ${token.substring(0, 8)}...`, error);
      lastError = error;
      // Jika error bukan rate limit, kita tetap coba token berikutnya jika ada
      continue;
    }
  }

  throw lastError || new Error("Semua GITHUB_TOKENS gagal digunakan.");
}

export async function generateText(prompt: string) {
  const model = "gpt-4o";
  const endpoint = "https://models.inference.ai.azure.com/chat/completions";

  if (GITHUB_TOKENS.length === 0) {
    throw new Error("GITHUB_TOKENS tidak ditemukan di environment variables.");
  }

  let lastError: any = null;

  for (const token of GITHUB_TOKENS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token.trim()}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 4096
        })
      });

      if (!response.ok) {
        if (response.status === 429) continue;
        throw new Error(`GitHub Models API Error (${response.status})`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (error) {
      lastError = error;
      continue;
    }
  }

  throw lastError || new Error("Semua GITHUB_TOKENS gagal digunakan.");
}

export async function generateJSON(prompt: string, systemInstruction?: string) {
  const model = "gpt-4o";
  const endpoint = "https://models.inference.ai.azure.com/chat/completions";

  if (GITHUB_TOKENS.length === 0) {
    throw new Error("GITHUB_TOKENS tidak ditemukan di environment variables.");
  }

  let lastError: any = null;

  for (const token of GITHUB_TOKENS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token.trim()}`
        },
        body: JSON.stringify({
          model,
          messages: [
            ...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []),
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 4096
        })
      });

      if (!response.ok) {
        if (response.status === 429) continue;
        throw new Error(`GitHub Models API Error (${response.status})`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      return content ? JSON.parse(content) : null;
    } catch (error) {
      lastError = error;
      continue;
    }
  }

  throw lastError || new Error("Semua GITHUB_TOKENS gagal digunakan.");
}
