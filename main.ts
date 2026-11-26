// Indostat — entrypoint (Node 22, standard library only).
// Situsnya adalah folder app/ di sebelah berkas ini: berkas statis biasa
// (index.html, CSS, modul ES) tanpa build step; semua konten dan datanya
// tersimpan di berkasnya sendiri, tidak ada yang dimuat dari jaringan.
// Program ini menyerahkan situs: menyalin app/ dan screenshots/ dari
// sebelah berkas ini ke /output, lalu menulis /output/dossier.json —
// ringkasan yang dibaca juri (screenshot, berkas first load beserta
// ukurannya, dan sumber) — memakai pustaka vendored make.fun.
// vendor/makefun-frontend.ts dibiarkan apa adanya: scorer mengharuskan
// dossier.json byte per byte sama dengan yang ditulis salinan miliknya.
//
// Jalankan di luar container grader dengan MAKEFUN_OUTPUT_DIR sebagai
// pengganti /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Lalu sajikan dengan `node serve.ts` dan buka http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// Batas scorer (reference/gate.json): hanya text_max_bytes yang membentuk
// byte; sisanya menolak entri yang scorer akan tolak (lebih dari 4
// screenshot atau satu di atas 256 KiB; lebih dari 993 berkas dan direktori
// di app/ atau 16 MiB berkas app/: app/ dihitung di samping batas 1000
// entri /output sendiri, screenshots/ dan dossier.json-nya).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
