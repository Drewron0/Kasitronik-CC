# Kasitronik

Website pengelolaan elektronik bekas dengan akun Supabase, submit barang, dan bantuan pengisian detail dari foto melalui Google Gemini.

## Setup dari clone baru

Gunakan **Node.js 22.18+** dan **pnpm 10.17.1**. Jalankan dari folder yang berisi `package.json`, bukan folder sisa `jan`.

```powershell
pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
```

Pada macOS/Linux gunakan `cp .env.example .env.local`. Jangan menimpa `.env.local` yang sudah dikonfigurasi.

| Variabel | Isi | Wajib |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL dari Supabase Connect | Ya |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key Supabase | Ya |
| `GEMINI_API_KEY` | Key dari [Google AI Studio](https://aistudio.google.com/apikey) | Hanya untuk saran AI |
| `GEMINI_MODEL` | Model dengan input gambar dan structured JSON, contoh `gemini-3.1-flash-lite` | Hanya untuk saran AI |

Submit manual tetap berjalan tanpa Gemini. Jangan gunakan secret/service-role key pada variabel publik. Jangan commit `.env.local`.

### Supabase: akun, tabel dan foto

1. Buka project Supabase milik tim. Pada Authentication, aktifkan Email/password.
2. Atur Site URL `http://localhost:3000` dan redirect URL `http://localhost:3000/login`. Sesuaikan untuk domain produksi.
3. Buka **SQL Editor > New query**, salin seluruh isi [`supabase/migrations/202611090001_item_submissions.sql`](supabase/migrations/202611090001_item_submissions.sql), lalu **Run** satu kali pada project tersebut. Bila tim memakai Supabase CLI dan project sudah di-link, migration ini juga bisa dijalankan melalui alur migrasi tim.
4. Pastikan tabel `public.item_submissions` dan bucket Storage **private** `submission-photos` tersedia. Migrasi juga memasang constraints dan Row Level Security (RLS). Anggota tim yang memakai project yang sama tidak perlu menjalankan migrasi ulang.
5. Bila konfirmasi email aktif, konfirmasi akun sebelum login. Untuk mengirim email ke pengguna umum, konfigurasi SMTP sesuai [panduan Supabase](https://supabase.com/docs/guides/auth/auth-smtp).

Migrasi berjalan dalam transaksi dan gagal tanpa perubahan parsial jika nama tabel/bucket sudah dipakai. Jangan menghapus data yang sudah ada; periksa struktur dan sesuaikan migrasi bersama pengelola. Key publik aplikasi tidak berwenang membuat tabel/bucket.

Kebijakan akses membatasi baca/insert ke pemilik akun. Pengguna tidak dapat mengubah status, mengedit kiriman, atau menghapus foto kiriman yang sudah tersimpan. Foto tidak memiliki URL publik. Detail kebijakan: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) dan [Storage access control](https://supabase.com/docs/guides/storage/security/access-control).

```bash
pnpm dev
```

Buka [localhost:3000](http://localhost:3000), atau URL Local yang ditampilkan terminal. Restart server setelah mengubah `.env.local`.

## Submit barang

1. Login, lalu klik **Submit barang** di beranda (`/reports/new`).
2. Pilih foto satu jenis barang: JPEG/PNG maksimal 5 MB dan 20 megapiksel.
3. Pilih **Isi manual** atau **Bantu isi dengan AI**. Jalur AI membutuhkan persetujuan pengiriman foto ke Google Gemini, lalu tombol **Buat saran dari foto**.
4. Periksa saran, kemudian **Isi kolom yang kosong** jika sesuai. Isi manual yang sudah ada tidak ditimpa; kolom hasil AI ditandai dan tetap bisa diedit.
5. Lengkapi kategori, nama barang, jumlah unit sejenis, dan kondisi fungsi. Merek/tipe dan catatan fisik opsional. Kondisi fungsi selalu dipilih pengguna.
6. Berat berlaku **per unit**: pilih belum tahu, hasil timbangan, atau perkiraan rentang. AI hanya boleh memberi rentang perkiraan, bukan hasil timbangan. Merek/model hanya disarankan jika terbaca; hasil tetap perlu diperiksa pengguna.
7. Centang konfirmasi detail, lalu **Submit barang**. Sukses menampilkan nomor kiriman dan status menunggu peninjauan.

Saran AI tidak menyimpan laporan dan tidak menyetujui/menolak barang. Submit menyimpan foto yang dinormalisasi menjadi JPEG (metadata dibuang), lalu detail ke Supabase dengan status `pending`. Mode manual tidak mengirim foto ke Google. Mode AI mengirim foto ke Google untuk diproses; jangan sertakan data pribadi pada foto.

Jika penyimpanan terputus dan status belum pasti, formulir mempertahankan salinan data dan ID untuk **Coba kirim kembali**. Jangan muat ulang halaman sebelum retry selesai: salinan retry berada di memori browser. Retry dengan ID sama tidak menambah laporan ganda. Foto yang berhasil diunggah tetapi belum memiliki baris dapat tertinggal ketika pengguna menutup halaman; pengelola perlu membersihkan upload yatim yang sudah lama melalui Storage API setelah memastikan tidak dirujuk kiriman.

Halaman daftar kiriman, peninjauan admin, lokasi penjemputan, dan penjadwalan belum termasuk fitur ini.

## Struktur dan endpoint

- `app/reports/new/page.tsx`: metadata dan layout bersama.
- `app/reports/components/`: form, detail barang, pratinjau saran.
- `app/reports/item-details.ts`: kategori, kondisi, validasi, penggabungan saran.
- `app/reports/interfaces/`: kontrak data dan props.
- `app/reports/actions/submit-report.action.ts`: request browser dengan access token (bukan Server Action).
- `lib/reports/request.ts`: autentikasi, pembatas request, validasi upload.
- `lib/ai/`: normalisasi foto, pembatas request, Gemini server-only.
- `supabase/migrations/`: tabel, constraints, bucket private, RLS.

Kedua endpoint memakai `Authorization: Bearer <access token>`, multipart/form-data, dan respons `Cache-Control: no-store`:

| Endpoint | Field | Respons sukses |
| --- | --- | --- |
| `POST /api/reports/suggest` | `photo`, `consent=yes` | `{ suggestion: { category, itemName, brandModel, quantity, notes, weightMinKg, weightMaxKg } }` |
| `POST /api/reports` | `photo`, `submissionId` UUID v4, `category`, `itemName`, `brandModel`, `quantity`, `condition`, `notes`, `weightKind`, `weightKg`, `weightMinKg`, `weightMaxKg`, `confirmed=yes` | `{ id, status: "pending" }` |

Kategori API: `computers`, `phones`, `appliances`, `displays`, `components`. Kondisi: `working`, `damaged`, `dead`, `dismantled`. Berat: `unknown`, `actual`, `estimate`. Owner ID ditentukan dari token terverifikasi, bukan input browser. Error berbentuk `{ error }` dengan status 400/401/413/429/502/503.

## Pemeriksaan dan deployment

```bash
pnpm test
pnpm exec tsc --noEmit
pnpm exec eslint . --max-warnings 0
pnpm build
pnpm start
```

Test lokal tidak memerlukan key: mencakup validasi saran, penggabungan tanpa menimpa manual, validasi submit, rate limit, decoding gambar, serta penyimpanan/retry dengan client Supabase tiruan. Build/lint dan test dengan client tiruan bukan bukti bahwa migrasi atau RLS sudah diuji pada project Supabase.

Uji integrasi setelah migrasi: login, submit manual, periksa satu baris dan foto private; coba AI lalu edit saran sebelum submit; coba error jaringan dan retry; pastikan akun kedua tidak dapat membaca kiriman/foto akun pertama dan akses tanpa token ditolak. Uji hasil AI berdasarkan kewajaran dan struktur, bukan kesamaan teks persis.

Environment produksi harus diisi pada server. Variabel `NEXT_PUBLIC_*` dibundel saat build: build ulang jika project berubah. Gemini key tetap server-only. Terapkan migrasi pada Supabase produksi sebelum membuka fitur.

### Batas operasional

- Pembatas 5 percobaan per pengguna per 10 menit, terpisah untuk saran dan submit. Termasuk input invalid setelah autentikasi.
- Limiter di memori satu proses dan reset saat restart; ganti dengan Redis/database sebelum multi-instance atau serverless. RLS membatasi kepemilikan, bukan kuota penyimpanan; tambahkan kuota database/storage untuk penggunaan publik berskala besar.
- Timeout Gemini 30 detik tanpa retry otomatis; permintaan AI dapat menimbulkan biaya sesuai kuota/billing Google.
- Sesuaikan batas reverse proxy/hosting: body sekitar 5 MB + 64 KB multipart. Beberapa hosting memiliki batas lebih rendah.

## Troubleshooting

- **Penyimpanan belum tersedia:** jalankan migrasi di project yang sama dengan URL `.env.local`; periksa RLS dan bucket.
- **AI belum tersedia:** isi kedua variabel Gemini dan restart. Isi manual tetap bisa digunakan.
- **401:** masuk kembali. User ID saja bukan pengganti token.
- **502 saat saran:** periksa key, akses model, kuota, dan jaringan; jangan log token atau foto.
- **429:** tunggu jendela 10 menit selesai.
- **Tailwind loader tidak ditemukan:** hentikan server, hapus cache `.next` pada root proyek, jalankan `pnpm install --frozen-lockfile`, lalu `pnpm dev`. Jangan install saat server aktif.
