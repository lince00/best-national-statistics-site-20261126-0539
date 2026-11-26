// Indostat — aplikasi satu halaman (hash routes, tanpa jaringan).
// Semua angka berasal dari app/data.js; grafik digambar sebagai SVG murni.
import { YEARS, INDICATORS, PROVINCES, META } from './data.js';

const app = document.getElementById('app');

// ---------- util angka (format Indonesia) ----------
const nf1 = (v) => v.toLocaleString('id-ID', { maximumFractionDigits: 1 });
const nf2 = (v) => v.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nf0 = (v) => v.toLocaleString('id-ID', { maximumFractionDigits: 0 });
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- grafik garis SVG ----------
function lineChart(key) {
  const ind = INDICATORS[key];
  const vals = ind.values;
  const W = 960, H = 340, PL = 64, PR = 24, PT = 26, PB = 44;
  const pts = YEARS.map((y, i) => ({ y, v: vals[i] })).filter((p) => p.v !== null);
  const all = pts.map((p) => p.v);
  let min = Math.min(...all), max = Math.max(...all);
  if (min === max) { min -= 1; max += 1; }
  const pad = (max - min) * 0.15;
  min -= pad; max += pad;
  const x = (i) => PL + (i * (W - PL - PR)) / (YEARS.length - 1);
  const y = (v) => PT + ((max - v) * (H - PT - PB)) / (max - min);
  const gridVals = 4;
  let g = '';
  for (let i = 0; i <= gridVals; i++) {
    const gv = min + ((max - min) * i) / gridVals;
    const gy = y(gv);
    g += `<line x1="${PL}" y1="${gy}" x2="${W - PR}" y2="${gy}" stroke="#e7edf1" stroke-width="1"/>` +
      `<text x="${PL - 10}" y="${gy + 4}" text-anchor="end" font-size="12" fill="#5b6b7a">${axisLabel(gv, ind)}</text>`;
  }
  let path = '';
  let last = null;
  vals.forEach((v, i) => {
    if (v === null) { last = null; return; }
    path += (last === null ? `M ${x(i)} ${y(v)}` : ` L ${x(i)} ${y(v)}`);
    last = v;
  });
  let dots = '';
  pts.forEach((p) => {
    const i = YEARS.indexOf(p.y);
    dots += `<circle cx="${x(i)}" cy="${y(p.v)}" r="5.5" fill="#0e7c6b" stroke="#fff" stroke-width="2" data-year="${p.y}" data-value="${p.v}" data-key="${key}"><title>${p.y}: ${ind.format(p.v)}</title></circle>`;
  });
  let labels = '';
  YEARS.forEach((yr, i) => {
    labels += `<text x="${x(i)}" y="${H - 14}" text-anchor="middle" font-size="12.5" fill="#5b6b7a">${yr}</text>`;
  });
  const lastPt = pts[pts.length - 1];
  const firstPt = pts[0];
  const change = lastPt.v - firstPt.v;
  const changeTxt = (change >= 0 ? '+' : '') + fmtAxis(change, ind);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik ${esc(ind.name)} 2019–2024">${g}` +
    `<path d="${path}" fill="none" stroke="#0e7c6b" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>${dots}${labels}</svg>` +
    `<p class="chart-readout" id="readout-${key}">2019: <strong>${ind.format(firstPt.v)}</strong> → 2024: <strong>${ind.format(lastPt.v)}</strong> ` +
    `(perubahan ${changeTxt}). Arahkan kursor ke titik untuk nilai tiap tahun.</p>`;
}

function axisLabel(v, ind) {
  if (ind === INDICATORS.pdb) return nf0(v);
  if (Math.abs(v) >= 100) return nf0(v);
  return nf1(v);
}
function fmtAxis(v, ind) {
  if (ind === INDICATORS.pdb) return 'Rp' + nf0(v) + ' T';
  return (v >= 0 ? '' : '') + nf1(v);
}

// ---------- grafik batang horizontal (provinsi) ----------
function barChart(rows) {
  const W = 960, rowH = 34, top = 8, labelW = 150, maxV = Math.max(...rows.map((r) => r.pop));
  let s = `<svg class="chart" viewBox="0 0 ${W} ${top + rows.length * rowH + 8}" role="img" aria-label="Penduduk provinsi terbesar">`;
  rows.forEach((r, i) => {
    const cy = top + i * rowH;
    const w = ((W - labelW - 90) * r.pop) / maxV;
    s += `<text x="0" y="${cy + 17}" font-size="13.5" fill="#1c2733">${esc(r.name)}</text>` +
      `<rect x="${labelW}" y="${cy + 4}" width="${w}" height="16" rx="4" fill="#0e7c6b"/>` +
      `<text x="${labelW + w + 10}" y="${cy + 17}" font-size="13" fill="#5b6b7a">${nf1(r.pop)} jt</text>`;
  });
  return s + '</svg>';
}

// ---------- komponen ----------
function kpiCard(key, link) {
  const ind = INDICATORS[key];
  const last = ind.values[ind.values.length - 1];
  const prev = ind.values[ind.values.length - 2];
  const d = last - prev;
  const up = d > 0, down = d < 0;
  // Untuk kemiskinan dan pengangguran, turun itu kabar baik.
  const goodWhenDown = key === 'miskin' || key === 'pengangguran';
  const good = up ? !goodWhenDown : down ? goodWhenDown : false;
  const bad = up ? goodWhenDown : down ? !goodWhenDown : false;
  const cls = good ? 'up' : bad ? 'down' : 'flat';
  const sign = up ? '▲' : down ? '▼' : '—';
  const deltaTxt = (up ? '+' : '') + (ind === INDICATORS.pdb ? 'Rp' + nf1(d) + ' T' : nf2(d).replace('-', '−'));
  return `<a class="kpi" href="#/${link}"><div class="k-label">${esc(ind.name)}</div>` +
    `<div class="k-value">${esc(ind.format(last))}</div>` +
    `<div class="k-sub">${esc(ind.unit)} · 2024</div>` +
    `<div class="k-delta ${cls}">${sign} ${deltaTxt} dari 2023</div></a>`;
}

function indicatorPanel(keys, activeKey) {
  const tabs = keys.map((k) =>
    `<button class="tab${k === activeKey ? ' active' : ''}" data-ind="${k}">${esc(INDICATORS[k].name)}</button>`).join('');
  const ind = INDICATORS[activeKey];
  return `<div class="panel"><div class="panel-head"><h2>${esc(ind.name)} <span class="source">· ${esc(ind.unit)}</span></h2>` +
    `<span class="source">Sumber: ${esc(ind.source)}</span></div>` +
    `<div class="tabs" role="tablist">${tabs}</div>` +
    `<div data-chart="${activeKey}">${lineChart(activeKey)}</div>` +
    `<p class="note">${esc(ind.note)}</p></div>`;
}

// ---------- halaman ----------
function homePage() {
  const top = [...PROVINCES].sort((a, b) => b.pop - a.pop).slice(0, 8);
  return `<section><span class="eyebrow">Data nasional · 2019–2024</span>
  <h1>Indonesia dalam angka</h1>
  <p class="lede">Situs statistik nasional Indonesia: penduduk 281,6 juta jiwa, ekonomi Rp22.139 triliun,
  dan capaian pembangunan manusia — disajikan per indikator dan per provinsi, dari data resmi BPS.</p></section>
  <section class="kpis" aria-label="Indikator utama 2024">
    ${kpiCard('penduduk', 'penduduk')}${kpiCard('pdb', 'ekonomi')}${kpiCard('tumbuh', 'ekonomi')}
    ${kpiCard('miskin', 'ekonomi')}${kpiCard('pengangguran', 'ekonomi')}${kpiCard('ipm', 'pendidikan')}
  </section>
  <section class="panel"><div class="panel-head"><h2>Pertumbuhan penduduk 2019–2024</h2>
  <span class="source">Sumber: BPS</span></div>
  ${lineChart('penduduk')}
  <p class="note">Penduduk bertambah sekitar 2,8–3,1 juta jiwa per tahun. Jawa masih menjadi pulau terpadat:
  tiga provinsi teratas — Jawa Barat, Jawa Timur, Jawa Tengah — menampung 130,3 juta jiwa, sekitar 46% penduduk Indonesia.</p></section>
  <section class="panel"><div class="panel-head"><h2>Provinsi berpenduduk terbesar</h2>
  <a href="#/provinsi">Lihat semua provinsi →</a></div>
  ${barChart(top)}
  <p class="source">Estimasi pertengahan 2024, BPS. 15 provinsi terbesar mencakup ±80% penduduk Indonesia.</p></section>
  <section><h2>Jelajahi datanya</h2><div class="link-cards">
    <a class="link-card" href="#/penduduk"><h3>Penduduk</h3><p>Jumlah penduduk dan sebaran per provinsi.</p><span class="go">Buka →</span></a>
    <a class="link-card" href="#/ekonomi"><h3>Ekonomi</h3><p>PDB, pertumbuhan, inflasi, pengangguran, kemiskinan.</p><span class="go">Buka →</span></a>
    <a class="link-card" href="#/kesehatan"><h3>Kesehatan</h3><p>Harapan hidup dan stunting balita.</p><span class="go">Buka →</span></a>
    <a class="link-card" href="#/pendidikan"><h3>Pendidikan</h3><p>IPM dan rata-rata lama sekolah.</p><span class="go">Buka →</span></a>
    <a class="link-card" href="#/provinsi"><h3>Provinsi</h3><p>Tabel 15 provinsi terbesar — cari, urutkan, bandingkan.</p><span class="go">Buka →</span></a>
    <a class="link-card" href="#/tentang"><h3>Tentang Data</h3><p>Sumber, definisi, dan catatan metodologi.</p><span class="go">Buka →</span></a>
  </div></section>`;
}

function pendudukPage(active = 'penduduk') {
  const top = [...PROVINCES].sort((a, b) => b.pop - a.pop).slice(0, 8);
  return `<section><span class="eyebrow">Penduduk</span><h1>Penduduk Indonesia</h1>
  <p class="lede">281,6 juta jiwa pada 2024 — negara keempat terpadat di dunia. Pertumbuhan sekitar 1% per tahun,
  dengan sebaran yang sangat timpang: 56% penduduk tinggal di Pulau Jawa.</p></section>
  ${indicatorPanel(['penduduk'], active)}
  <section class="panel"><div class="panel-head"><h2>Delapan provinsi terbesar</h2>
  <a href="#/provinsi">Tabel lengkap →</a></div>${barChart(top)}</section>
  <section class="cols"><div class="panel"><h3>Fakta penduduk</h3><ul class="fact-list">
    <li><span>Pertambahan 2023 → 2024</span><b>+2,9 juta jiwa</b></li>
    <li><span>Laju tumbuh penduduk</span><b>±1,0% / tahun</b></li>
    <li><span>Provinsi terpadat</span><b>DKI Jakarta</b></li>
    <li><span>Kepadatan DKI Jakarta</span><b>±16.100 jiwa/km²</b></li>
    <li><span>Penduduk Pulau Jawa</span><b>±56% nasional</b></li>
  </ul></div>
  <div class="panel"><h3>Yang perlu diperhatikan</h3><p>Bonus demografi: penduduk usia kerja mencapai
  152,1 juta orang (Agustus 2024). Tantangannya adalah pemerataan — kepadatan Jawa Barat 1.423 jiwa/km²
  berbanding Kalimantan Barat 38 jiwa/km² — serta layanan dasar di kawasan timur.</p>
  <p class="source">Sumber: BPS, Sakernas Agustus 2024.</p></div></section>`;
}

function ekonomiPage(active = 'pdb') {
  return `<section><span class="eyebrow">Ekonomi</span><h1>Ekonomi Indonesia</h1>
  <p class="lede">PDB Rp22.139 triliun pada 2024 dengan pertumbuhan 5,03%. Kemiskinan di titik terendah
  sepanjang sejarah pencatatan BPS: 8,57%.</p></section>
  ${indicatorPanel(['pdb', 'tumbuh', 'kapitapdb', 'inflasi', 'pengangguran', 'miskin'], active)}
  <section class="cols"><div class="panel"><h3>Angka kunci 2024</h3><ul class="fact-list">
    <li><span>PDB harga berlaku</span><b>Rp22.139 T</b></li>
    <li><span>PDB per kapita</span><b>Rp78,6 jt (USD 4.960)</b></li>
    <li><span>Pertumbuhan</span><b>5,03%</b></li>
    <li><span>Inflasi kalender</span><b>1,57%</b></li>
    <li><span>Pengangguran (Agu)</span><b>4,91%</b></li>
    <li><span>Kemiskinan (Sep)</span><b>8,57% · 24,06 jt orang</b></li>
    <li><span>Garis kemiskinan (Sep)</span><b>Rp595.242 /kapita/bln</b></li>
  </ul></div>
  <div class="panel"><h3>Membaca trennya</h3><p>Setelah kontraksi pandemi 2020, ekonomi tumbuh di atas 5% tiga
  tahun beruntun. Inflasi 2022 yang sempat 5,51% sudah kembali ke 1,57%. Kemiskinan kota 6,66% dan desa 11,34% —
  kesenjangan desa-kota masih menjadi pekerjaan rumah terbesar.</p>
  <p class="source">Sumber: BPS, Berita Resmi Statistik 2025.</p></div></section>`;
}

function kesehatanPage(active = 'harapanHidup') {
  return `<section><span class="eyebrow">Kesehatan</span><h1>Kesehatan penduduk</h1>
  <p class="lede">Angka harapan hidup 74,15 tahun pada 2024. Stunting balita turun ke 19,8% — masih di atas
  target nasional 14% pada 2024, tapi trennya membaik setiap tahun.</p></section>
  ${indicatorPanel(['harapanHidup', 'stunting'], active)}
  <section class="cols"><div class="panel"><h3>Angka kunci</h3><ul class="fact-list">
    <li><span>Harapan hidup 2024</span><b>74,15 tahun</b></li>
    <li><span>Stunting balita 2024</span><b>19,8%</b></li>
    <li><span>Stunting 2019</span><b>27,7%</b></li>
    <li><span>Penurunan 5 tahun</span><b>−7,9 poin</b></li>
  </ul></div>
  <div class="panel"><h3>Membaca trennya</h3><p>Harapan hidup sempat stagnan saat pandemi (71,47 tahun pada 2020)
  lalu naik kembali. Stunting turun 7,9 poin dalam lima tahun — laju tercepat ada pada 2021–2022 — didorong
  intervensi gizi dan sanitasi. Survei stunting tidak dilakukan pada 2020.</p>
  <p class="source">Sumber: BPS (IPM); Kemenkes, SSGI &amp; Survei Kesehatan Indonesia.</p></div></section>`;
}

function pendidikanPage(active = 'ipm') {
  return `<section><span class="eyebrow">Pendidikan</span><h1>Pendidikan &amp; pembangunan manusia</h1>
  <p class="lede">IPM 75,02 pada 2024 — kategori tinggi. Rata-rata lama sekolah 9,21 tahun: setara kelas 3 SMP
  menuju SMA. Kedua angka naik setiap tahun sejak 2019.</p></section>
  ${indicatorPanel(['ipm', 'lamaSekolah'], active)}
  <section class="cols"><div class="panel"><h3>Angka kunci 2024</h3><ul class="fact-list">
    <li><span>IPM</span><b>75,02 (tinggi)</b></li>
    <li><span>Rata-rata lama sekolah</span><b>9,21 tahun</b></li>
    <li><span>Harapan hidup (komponen IPM)</span><b>74,15 tahun</b></li>
    <li><span>PDB per kapita (komponen IPM)</span><b>Rp78,6 jt</b></li>
  </ul></div>
  <div class="panel"><h3>Membaca trennya</h3><p>IPM naik 3,1 poin dalam lima tahun. Komponen pendidikan
  adalah yang paling lambat bergerak: rata-rata lama sekolah hanya naik 0,87 tahun sejak 2019, dari 8,34
  menjadi 9,21 tahun — PR terbesar ada pada pemerataan pendidikan menengah di luar Jawa.</p>
  <p class="source">Sumber: BPS, Indeks Pembangunan Manusia 2024.</p></div></section>`;
}

// ---------- halaman provinsi ----------
let provState = { q: '', island: 'Semua', sort: 'pop', dir: -1, selected: null };

function provRows() {
  let rows = PROVINCES.map((p) => {
    const density = (p.pop * 1000000) / p.area;
    const share = (p.pop / META.totalPop2024) * 100;
    return { ...p, density, share };
  });
  if (provState.island !== 'Semua') rows = rows.filter((r) => r.island === provState.island);
  if (provState.q) {
    const q = provState.q.toLowerCase();
    rows = rows.filter((r) => r.name.toLowerCase().includes(q) || r.island.toLowerCase().includes(q));
  }
  const k = provState.sort, d = provState.dir;
  rows.sort((a, b) => {
    const av = a[k], bv = b[k];
    if (typeof av === 'string') return d * av.localeCompare(bv, 'id');
    return d * (av - bv);
  });
  return rows;
}

function provinsiPage() {
  const rows = provRows();
  const maxPop = Math.max(...PROVINCES.map((p) => p.pop));
  const islands = ['Semua', ...new Set(PROVINCES.map((p) => p.island))];
  const sel = provState.selected ? PROVINCES.find((p) => p.name === provState.selected) : null;
  let detail = '';
  if (sel) {
    const rank = [...PROVINCES].sort((a, b) => b.pop - a.pop).findIndex((p) => p.name === sel.name) + 1;
    const density = (sel.pop * 1000000) / sel.area;
    const share = (sel.pop / META.totalPop2024) * 100;
    detail = `<div class="panel detail"><h3>${esc(sel.name)} — peringkat ${rank} dari 15 provinsi terbesar</h3>
    <div class="detail-grid">
      <div class="stat"><div class="s-label">Penduduk 2024</div><div class="s-value">${nf1(sel.pop)} jt</div></div>
      <div class="stat"><div class="s-label">Pangsa nasional</div><div class="s-value">${nf1(share)}%</div></div>
      <div class="stat"><div class="s-label">Luas wilayah</div><div class="s-value">${nf0(sel.area)} km²</div></div>
      <div class="stat"><div class="s-label">Kepadatan</div><div class="s-value">${nf0(density)} /km²</div></div>
    </div>
    <p class="source">Pulau ${esc(sel.island)}. Klik baris lain untuk membandingkan provinsi.</p></div>`;
  }
  const th = (label, key) =>
    `<th><button data-sort="${key}" aria-label="Urutkan menurut ${label}">${label}${provState.sort === key ? (provState.dir === 1 ? ' ▲' : ' ▼') : ''}</button></th>`;
  const body = rows.map((r) => {
    const w = (r.pop / maxPop) * 100;
    return `<tr data-prov="${esc(r.name)}" class="${provState.selected === r.name ? 'selected' : ''}">
      <td><strong>${esc(r.name)}</strong></td><td>${esc(r.island)}</td>
      <td>${nf1(r.pop)}</td><td>${nf1(r.share)}%</td><td>${nf0(r.area)}</td><td>${nf0(r.density)}</td>
      <td class="bar-cell"><div class="bar-track"><div class="bar-fill" style="width:${w.toFixed(1)}%"></div></div></td></tr>`;
  }).join('');
  return `<section><span class="eyebrow">Provinsi</span><h1>Provinsi berpenduduk terbesar</h1>
  <p class="lede">15 provinsi terbesar menampung ±80% penduduk Indonesia. Cari, saring per pulau,
  urutkan kolomnya, dan klik baris untuk melihat detail provinsi.</p></section>
  <section class="panel">
    <div class="tools">
      <input type="search" id="prov-search" placeholder="Cari provinsi atau pulau…" value="${esc(provState.q)}" aria-label="Cari provinsi">
      <select id="prov-island" aria-label="Saring pulau">${islands.map((i) =>
        `<option${i === provState.island ? ' selected' : ''}>${i}</option>`).join('')}</select>
      <span class="source">${rows.length} provinsi ditampilkan · estimasi 2024, BPS</span>
    </div>
    <div class="table-wrap"><table class="data">
      <thead><tr>${th('Provinsi', 'name')}${th('Pulau', 'island')}${th('Penduduk (jt)', 'pop')}${th('Pangsa', 'share')}${th('Luas (km²)', 'area')}${th('Kepadatan /km²', 'density')}<th>Perbandingan</th></tr></thead>
      <tbody>${body || '<tr><td colspan="7">Tidak ada provinsi yang cocok dengan pencarian.</td></tr>'}</tbody>
    </table></div>
    ${detail}
    <p class="note">Kepadatan = penduduk ÷ luas wilayah. DKI Jakarta (±16.100 jiwa/km²) adalah provinsi
    terpadat — sekitar 400 kali Kalimantan Barat (±38 jiwa/km²). Luas memakai angka resmi wilayah.</p>
  </section>`;
}

function tentangPage() {
  return `<section><span class="eyebrow">Tentang Data</span><h1>Sumber &amp; metodologi</h1>
  <p class="lede">Indostat menyajikan angka resmi yang sudah dipublikasikan. Situs ini bukan situs BPS —
  ia merangkum angka-angka BPS dan Kemenkes agar mudah dijelajah.</p></section>
  <section class="panel"><h2>Sumber</h2><ul class="fact-list">
    <li><span>Penduduk, PDB, inflasi</span><b>BPS — Berita Resmi Statistik</b></li>
    <li><span>Pengangguran</span><b>BPS — Sakernas Agustus</b></li>
    <li><span>Kemiskinan</span><b>BPS — Profil Kemiskinan (Susenas)</b></li>
    <li><span>IPM, harapan hidup, lama sekolah</span><b>BPS — Indeks Pembangunan Manusia</b></li>
    <li><span>Stunting balita</span><b>Kemenkes — SSGI / SKI</b></li>
    <li><span>Populasi provinsi</span><b>BPS — estimasi pertengahan 2024</b></li>
  </ul></section>
  <section class="panel"><h2>Definisi singkat</h2><ul class="fact-list">
    <li><span>PDB harga berlaku</span><b>Nilai seluruh barang/jasa setahun, harga tahun berjalan</b></li>
    <li><span>Pertumbuhan ekonomi</span><b>Perubahan PDB harga konstan, y-on-y</b></li>
    <li><span>TPT</span><b>Penganggur ÷ angkatan kerja × 100%</b></li>
    <li><span>Garis kemiskinan</span><b>Pengeluaran minimum kebutuhan dasar/kapita/bulan</b></li>
    <li><span>IPM</span><b>Gabungan kesehatan, pendidikan, dan standar hidup layak</b></li>
    <li><span>Stunting</span><b>Balita dengan tinggi badan di bawah standar usianya</b></li>
  </ul>
  <p class="note">Catatan: angka 2020 untuk stunting kosong karena survei tidak dilakukan pada tahun itu.
  Angka per kapita 2019–2024 dihitung dari PDB dibagi penduduk. Pembulatan dapat membuat total sedikit berbeda.</p></section>
  <section class="panel"><h2>Teknis situs</h2><p>Situs statis: HTML, CSS, dan JavaScript biasa tanpa
  dependensi luar. Grafik digambar sebagai SVG oleh JavaScript di berkasnya sendiri. Semua data tersimpan di
  <code>app/data.js</code>. Tidak ada permintaan jaringan, pelacak, atau kuki.</p></section>`;
}

// ---------- router ----------
const TITLES = {
  '': 'Indostat — Statistik Indonesia',
  penduduk: 'Penduduk — Indostat',
  ekonomi: 'Ekonomi — Indostat',
  kesehatan: 'Kesehatan — Indostat',
  pendidikan: 'Pendidikan — Indostat',
  provinsi: 'Provinsi — Indostat',
  tentang: 'Tentang Data — Indostat',
};

let activeInd = { ekonomi: 'pdb', kesehatan: 'harapanHidup', pendidikan: 'ipm', penduduk: 'penduduk' };

function render() {
  const hash = location.hash.replace(/^#\/?/, '');
  const route = hash.split('/')[0] || '';
  document.querySelectorAll('.nav a').forEach((a) => {
    a.classList.toggle('active', a.dataset.route === route);
  });
  document.title = TITLES[route] || TITLES[''];
  if (route === 'penduduk') app.innerHTML = pendudukPage(activeInd.penduduk);
  else if (route === 'ekonomi') app.innerHTML = ekonomiPage(activeInd.ekonomi);
  else if (route === 'kesehatan') app.innerHTML = kesehatanPage(activeInd.kesehatan);
  else if (route === 'pendidikan') app.innerHTML = pendidikanPage(activeInd.pendidikan);
  else if (route === 'provinsi') app.innerHTML = provinsiPage();
  else if (route === 'tentang') app.innerHTML = tentangPage();
  else app.innerHTML = homePage();
  window.scrollTo(0, 0);
}

// ---------- interaksi (delegasi klik) ----------
app.addEventListener('click', (ev) => {
  const tab = ev.target.closest('.tab');
  if (tab) {
    const key = tab.dataset.ind;
    const hash = location.hash.replace(/^#\/?/, '').split('/')[0] || '';
    if (hash === 'ekonomi') activeInd.ekonomi = key;
    else if (hash === 'kesehatan') activeInd.kesehatan = key;
    else if (hash === 'pendidikan') activeInd.pendidikan = key;
    else if (hash === 'penduduk') activeInd.penduduk = key;
    render();
    return;
  }
  const sortBtn = ev.target.closest('button[data-sort]');
  if (sortBtn) {
    const key = sortBtn.dataset.sort;
    if (provState.sort === key) provState.dir = -provState.dir;
    else { provState.sort = key; provState.dir = key === 'name' || key === 'island' ? 1 : -1; }
    render();
    return;
  }
  const row = ev.target.closest('tr[data-prov]');
  if (row) {
    provState.selected = provState.selected === row.dataset.prov ? null : row.dataset.prov;
    render();
  }
});

app.addEventListener('input', (ev) => {
  if (ev.target.id === 'prov-search') {
    provState.q = ev.target.value;
    render();
    const input = document.getElementById('prov-search');
    if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
  }
});
app.addEventListener('change', (ev) => {
  if (ev.target.id === 'prov-island') { provState.island = ev.target.value; render(); }
});

// Arahkan kursor ke titik grafik: tampilkan nilainya di baris readout.
app.addEventListener('mouseover', (ev) => {
  const dot = ev.target.closest('circle[data-year]');
  if (!dot) return;
  const key = dot.dataset.key;
  const readout = document.getElementById('readout-' + key);
  if (readout) {
    const ind = INDICATORS[key];
    readout.innerHTML = `${dot.dataset.year}: <strong>${esc(ind.format(Number(dot.dataset.value)))}</strong> — ${esc(ind.name)} (${esc(ind.unit)}).`;
  }
});

window.addEventListener('hashchange', render);
render();
