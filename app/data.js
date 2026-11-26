// Data statistik Indonesia 2019-2024.
// Angka-angka di bawah ini adalah angka publikasi Badan Pusat Statistik (BPS)
// yang dikutip dari rilis resmi BPS (Berita Resmi Statistik dan publikasi
// Statistik Indonesia). Nilai 2024 adalah angka terakhir yang dirilis BPS.
// Semua nilai ditulis apa adanya di file ini; situs tidak mengambil data
// dari jaringan mana pun.

export const YEARS = [2019, 2020, 2021, 2022, 2023, 2024];

// Setiap indikator: label, satuan, sumber, catatan, dan deret tahunan.
// Nilai null berarti tidak ada survei/publikasi pada tahun itu.
export const INDICATORS = {
  penduduk: {
    name: 'Jumlah Penduduk',
    unit: 'juta jiwa',
    source: 'BPS, Proyeksi & Sensus Penduduk',
    note: 'Penduduk pertengahan tahun (30 Juni). Indonesia negara ke-4 terpadat di dunia.',
    values: [268.1, 270.2, 272.7, 275.8, 278.7, 281.6],
    format: (v) => v.toFixed(1) + ' jt',
  },
  pdb: {
    name: 'PDB Harga Berlaku',
    unit: 'triliun rupiah',
    source: 'BPS, PDB Indonesia',
    note: 'Produk Domestik Bruto atas dasar harga berlaku. 2024: Rp22.139,0 triliun.',
    values: [15832.6, 15443.4, 16976.7, 19588.5, 20892.3, 22139.0],
    format: (v) => 'Rp' + v.toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' T',
  },
  tumbuh: {
    name: 'Pertumbuhan Ekonomi',
    unit: 'persen (y-on-y)',
    source: 'BPS, PDB Indonesia',
    note: '2020 terkontraksi -2,07% karena pandemi; sejak 2022 kembali tumbuh di atas 5%.',
    values: [5.02, -2.07, 3.7, 5.31, 5.05, 5.03],
    format: (v) => v.toFixed(2).replace('.', ',') + '%',
  },
  kapitapdb: {
    name: 'PDB per Kapita',
    unit: 'juta rupiah',
    source: 'BPS, dihitung dari PDB dan penduduk',
    note: '2024: Rp78,6 juta per orang, setara USD 4.960.',
    values: [59.1, 57.2, 62.2, 71.0, 75.0, 78.6],
    format: (v) => 'Rp' + v.toFixed(1).replace('.', ',') + ' jt',
  },
  inflasi: {
    name: 'Inflasi Tahunan',
    unit: 'persen (kalender)',
    source: 'BPS, Indeks Harga Konsumen',
    note: 'Inflasi 2022 melonjak ke 5,51% lalu kembali ke 1,57% pada 2024.',
    values: [2.72, 1.68, 1.87, 5.51, 2.61, 1.57],
    format: (v) => v.toFixed(2).replace('.', ',') + '%',
  },
  pengangguran: {
    name: 'Tingkat Pengangguran Terbuka',
    unit: 'persen (Agustus)',
    source: 'BPS, Sakernas Agustus',
    note: 'Agustus 2024: 4,91% — terendah sejak 2019; puncak pandemi 7,07% (2020).',
    values: [5.28, 7.07, 6.49, 5.86, 5.32, 4.91],
    format: (v) => v.toFixed(2).replace('.', ',') + '%',
  },
  miskin: {
    name: 'Penduduk Miskin',
    unit: 'persen (September)',
    source: 'BPS, Profil Kemiskinan (Susenas)',
    note: 'September 2024: 8,57% (24,06 juta orang) — terendah sejak BPS merilis angka kemiskinan 1960.',
    values: [9.22, 10.19, 9.71, 9.57, 9.36, 8.57],
    format: (v) => v.toFixed(2).replace('.', ',') + '%',
  },
  harapanHidup: {
    name: 'Angka Harapan Hidup',
    unit: 'tahun',
    source: 'BPS, IPM',
    note: 'Bayi lahir 2024 diperkirakan hidup rata-rata 74,15 tahun.',
    values: [71.34, 71.47, 71.57, 71.85, 73.93, 74.15],
    format: (v) => v.toFixed(2).replace('.', ',') + ' thn',
  },
  ipm: {
    name: 'Indeks Pembangunan Manusia',
    unit: 'skala 0-100',
    source: 'BPS, IPM',
    note: 'IPM 2024: 75,02 — kategori tinggi. Naik dari 71,92 pada 2019.',
    values: [71.92, 71.94, 72.29, 73.37, 74.39, 75.02],
    format: (v) => v.toFixed(2).replace('.', ','),
  },
  lamaSekolah: {
    name: 'Rata-rata Lama Sekolah',
    unit: 'tahun',
    source: 'BPS, IPM',
    note: 'Penduduk 25 tahun ke atas rata-rata bersekolah 9,21 tahun pada 2024.',
    values: [8.34, 8.48, 8.54, 8.7, 9.13, 9.21],
    format: (v) => v.toFixed(2).replace('.', ',') + ' thn',
  },
  stunting: {
    name: 'Prevalensi Stunting Balita',
    unit: 'persen',
    source: 'Kemenkes, SSGI / Survei Kesehatan Indonesia',
    note: 'Turun dari 27,7% (2019) menjadi 19,8% (2024). Tidak ada survei pada 2020.',
    values: [27.7, null, 24.4, 21.6, 21.5, 19.8],
    format: (v) => v.toFixed(1).replace('.', ',') + '%',
  },
};

// 15 provinsi berpenduduk terbesar, estimasi pertengahan 2024 (BPS).
// Populasi dalam juta jiwa; luas dalam km persegi (angka resmi pemda/BPS).
// Kepadatan dihitung situs dari kedua angka itu.
export const PROVINCES = [
  { name: 'Jawa Barat', island: 'Jawa', pop: 50.35, area: 35378 },
  { name: 'Jawa Timur', island: 'Jawa', pop: 41.81, area: 47803 },
  { name: 'Jawa Tengah', island: 'Jawa', pop: 38.12, area: 32801 },
  { name: 'Sumatera Utara', island: 'Sumatera', pop: 15.59, area: 72981 },
  { name: 'Banten', island: 'Jawa', pop: 12.43, area: 9663 },
  { name: 'DKI Jakarta', island: 'Jawa', pop: 10.68, area: 664 },
  { name: 'Sulawesi Selatan', island: 'Sulawesi', pop: 9.46, area: 46717 },
  { name: 'Lampung', island: 'Sumatera', pop: 9.2, area: 34624 },
  { name: 'Sumatera Selatan', island: 'Sumatera', pop: 8.84, area: 91592 },
  { name: 'Riau', island: 'Sumatera', pop: 6.64, area: 87024 },
  { name: 'Sumatera Barat', island: 'Sumatera', pop: 5.79, area: 42013 },
  { name: 'Kalimantan Barat', island: 'Kalimantan', pop: 5.66, area: 147307 },
  { name: 'Aceh', island: 'Sumatera', pop: 5.6, area: 57956 },
  { name: 'Bali', island: 'Bali', pop: 4.42, area: 5780 },
  { name: 'Kalimantan Timur', island: 'Kalimantan', pop: 4.03, area: 127347 },
];

export const META = {
  country: 'Indonesia',
  updated: 'Data terakhir: 2024 (rilis BPS 2025)',
  totalPop2024: 281.6,
};
