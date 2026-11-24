# Alur Pengepul - Desain

Tanggal: 2026-11-24
Status: disetujui (revisi 2: kanal notifikasi gratis)

## 1. Maksud dan alasan

Kasitronik menghubungkan warga yang punya barang elektronik bekas dengan pengepul. Sisi warga sudah ada
(lapor barang, foto, lokasi, dashboard status), tetapi **sisi pengepul belum ada sama sekali**: nama dan
nomor pengepul hanya diisi lewat halaman `/debug`.

Pengepul jarang membuka website, jadi pekerjaan harus datang ke HP mereka. Dua prinsip:

- **Pengepul minta yang simpel:** tanpa akun, tanpa password, satu-dua klik per laporan.
- **Warga minta yang aman:** tahu siapa yang datang, nomornya tidak tersebar, ada bukti serah terima.
- **Biaya Rp 0:** tim memilih kanal gratis daripada WhatsApp resmi (sekitar Rp 357 per pesan).

## 2. Tujuan, bukan-tujuan, anti-tujuan

**Tujuan**
- Laporan baru sampai ke pengepul yang tepat sebagai notifikasi HP, dan diambil oleh satu pengepul.
- Pengepul bisa mengambil, chat WA ke pemilik, dan menyelesaikan penjemputan dari satu link.
- Warga mendapat kabar lewat email dan dashboard: siapa pengepulnya, kode serah terima, tanda terima.
- Tim Kasitronik bisa menambah/menonaktifkan pengepul dan melihat laporan yang tidak terambil.

**Bukan tujuan (tahap ini)**
- Pembayaran di dalam aplikasi. Harga disepakati dan dibayar langsung (tunai/transfer).
- Akun login untuk pengepul.
- Pesan WhatsApp otomatis dari sistem (bisa ditambah nanti lewat interface notifikasi yang sama).
- Otomatisasi grup WA. Grup (jika ada) diatur manual "hanya admin yang bisa kirim", untuk pengumuman.
- Slot sponsor, perbaikan login/register, perbaikan margin (dikerjakan terpisah).

**Anti-tujuan (gagal walau "jalan")**
- Grup WA jadi ramai karena klaim laporan.
- Pengepul dibanjiri notifikasi sampai mematikannya.
- Nomor HP atau alamat lengkap warga terlihat oleh pengepul yang belum mengambil laporan.
- Siapa pun (termasuk pemilik) bisa menandai laporan "selesai" tanpa serah terima nyata.
- Ada biaya bulanan per pesan.

## 3. Batasan

- Next.js 16 (App Router) + Supabase, deploy ke VPS CloudPanel + PM2 lewat GitHub Actions.
- Semua klien Supabase saat ini memakai kunci publishable. Aksi pengepul (tanpa login) butuh kunci
  **secret** khusus server (`SUPABASE_SECRET_KEY`), tidak boleh berawalan `NEXT_PUBLIC_`.
- Aturan `AGENTS.md` berlaku penuh.
- Web push: Android (Chrome) langsung jalan; iPhone hanya setelah link ditambahkan ke layar utama
  (iOS 16.4+). Panduan resmi: `node_modules/next/dist/docs/01-app/02-guides/progressive-web-apps.md`.
- Email lewat SMTP biasa (mis. Gmail dengan app password, gratis sampai sekitar 500 email per hari).

## 4. Pendekatan yang dipertimbangkan

| Pendekatan | Biaya | Kekurangan |
|---|---|---|
| **A. Web push untuk pengepul + email untuk warga** | Rp 0 | iPhone perlu "Tambahkan ke layar utama" |
| B. WhatsApp resmi untuk pengepul, email untuk warga | sekitar Rp 1.000 per laporan | Perlu Meta Business, kartu kredit, template disetujui |
| C. WhatsApp tidak resmi dari VPS (Baileys dsb.) | Rp 0 | Melanggar ketentuan WA, nomor bisa diblokir, semua notifikasi mati |

**Dipilih: A** (pilihan tim). Semua pengiriman lewat satu interface `Notifier`, supaya B bisa ditambah
nanti tanpa mengubah logika. WhatsApp tetap dipakai untuk **chat langsung** pengepul ke warga lewat
link `wa.me` (gratis, tidak lewat sistem).

Untuk klaim: **link pribadi per pengepul, siapa cepat dia dapat**, bukan grup. Untuk volume:
**kirim bertahap ke 3 pengepul terdekat**, plus tombol jeda dan mode rangkuman.

## 5. Desain

### 5.1 Peran

- **Warga (pemilik barang):** akun Supabase seperti sekarang.
- **Pengepul:** tidak punya akun. Dikenali lewat token rahasia di link pribadi `/p/<token>`.
- **Admin:** akun Supabase dengan `app_metadata.role = 'admin'` (diset manual di dashboard Supabase).

### 5.2 Alur utama

1. Warga mengirim laporan. Form ditambah kolom **nomor WA** (wajib, diisi otomatis dari laporan terakhir).
2. Server membuat **kode serah terima 4 angka**, mencari nama kecamatan dari titik jemput, lalu
   menjalankan `dispatch` gelombang 1.
3. **Dispatch:** pengepul yang aktif, tidak dijeda, mode `instant`, dan wilayahnya mencakup titik jemput,
   diurutkan menurut jarak. Ambil 3 teratas yang belum pernah ditawari laporan ini, buat `job_offer`
   (token unik), kirim web push ke semua perangkat terdaftar milik pengepul itu.
4. **Cron tiap 5 menit:** laporan `pending` yang gelombang terakhirnya lebih dari 30 menit lalu mendapat
   gelombang berikutnya. Setelah 3 gelombang, atau kalau tidak ada pengepul tersisa, kirim email ke
   admin (`ADMIN_EMAIL`) dan tampilkan di halaman admin sebagai "Belum terambil".
5. Notifikasi membuka `/j/<token>`. Sebelum klaim, pengepul melihat foto, jenis dan jumlah barang,
   kondisi, perkiraan berat, **kecamatan dan jarak saja**, lalu tombol **Ambil laporan**.
6. **Klaim atomik:** update bersyarat `status = 'pending' and collector_id is null`. Yang kalah melihat
   "Laporan ini sudah diambil pengepul lain". Offer lain ditandai `lost`, tanpa notifikasi.
7. Setelah klaim, halaman menampilkan alamat lengkap, peta, catatan lokasi, tombol **Chat pemilik**
   (`https://wa.me/<nomor>`), dan form selesai. Warga menerima email: nama pengepul, nomornya,
   rating, dan kode serah terima.
8. Saat menjemput, pengepul mengetik **kode dari pemilik** dan **harga disepakati** (opsional, kosong
   berarti gratis), lalu **Selesai dijemput**. Kode salah 5 kali mengunci form 15 menit. Status menjadi
   `completed` dan warga menerima email tanda terima.
9. Warga memberi rating di dashboard.

Cabang:
- **Pengepul melepas laporan:** status kembali `pending`, `collector_id` kosong, dispatch lanjut ke
  pengepul berikutnya. Warga mendapat email.
- **Warga membatalkan** saat `pending` atau `accepted`. Kalau sudah ada pengepul, ia mendapat push.
- **Laporkan masalah** (warga, saat `accepted`/`completed`): email ke admin dan tampil di halaman admin.

### 5.3 Halaman pengepul (tanpa login, mobile-first, `noindex`)

- `/p/<token>` - beranda pengepul dari link permanen: tombol **Aktifkan notifikasi** (dengan petunjuk
  "Tambahkan ke layar utama" untuk iPhone), laporan yang sedang ia pegang, laporan terbuka di
  wilayahnya (tombol Ambil langsung dari sini), **Jeda / Aktifkan**, mode (`instant` / `digest`), dan
  wilayah (titik di peta + radius km, bisa lebih dari satu; memakai ulang `MapPicker`).
- `/j/<token>` - satu laporan (langkah 5-8). Satu aksi utama per keadaan.
- PWA: `app/manifest.ts` dengan `start_url` ke `/p/<token>` tidak bisa per orang, jadi `start_url` adalah
  `/p` yang membaca token dari cookie `kasitronik_collector` (httpOnly, diset saat `/p/<token>` dibuka).

Sketsa `/j/<token>` setelah klaim:

```
Laptop x2 - Jl. Banjarsari 12
[ peta kecil ]
[ Chat pemilik ]

Kode dari pemilik  [ _ _ _ _ ]
Harga disepakati   [ Rp ______ ]
[ Selesai dijemput ]            Lepas laporan
```

### 5.4 Notifikasi

| Jenis | Kanal | Ke | Isi singkat |
|---|---|---|---|
| `offer` | push | pengepul | Laporan baru, kecamatan, barang, jarak, buka `/j/` |
| `digest` | push (08.00 dan 16.00 WIB) | pengepul mode rangkuman | "Ada N laporan baru di wilayah Anda", buka `/p` |
| `collector_cancelled` | push | pengepul | Laporan dibatalkan pemilik |
| `owner_claimed` | email | warga | Nama pengepul, nomor, rating, kode serah terima |
| `owner_released` | email | warga | Pengepul melepas, sedang dicarikan pengganti |
| `owner_done` | email | warga | Selesai, harga tercatat, link dashboard |
| `admin_alert` | email | admin | Laporan belum terambil / laporan masalah |

Pengepul tanpa perangkat push terdaftar ditandai "Notifikasi belum aktif" di halaman admin, supaya tim
bisa membantunya. Teks tanpa emoji.

### 5.5 Data (migrasi baru)

- `collectors`: `id`, `name`, `phone` (format `62...`), `active`, `paused`, `notify_mode`
  (`instant`|`digest`), `access_token_hash`, `last_digest_at`, `created_at`.
- `collector_areas`: `id`, `collector_id`, `center_latitude`, `center_longitude`, `radius_km` (1-30).
- `push_subscriptions`: `id`, `collector_id`, `endpoint` (unik), `p256dh`, `auth`, `created_at`.
  Langganan yang dijawab 404/410 oleh layanan push dihapus.
- `job_offers`: `id`, `submission_id`, `collector_id`, `token_hash`, `wave`, `status`
  (`sent`|`claimed`|`lost`|`released`|`cancelled`), `sent_at`, `opened_at`. Unik `(submission_id, collector_id)`.
- `notification_log`: `id`, `channel` (`push`|`email`), `kind`, `recipient`, `payload` (jsonb),
  `status` (`sent`|`failed`), `attempts`, `last_error`, `created_at`. Cron mencoba ulang yang gagal
  sampai 3 kali.
- `item_submissions` ditambah: `owner_phone`, `pickup_district`, `collector_id` (FK), `handover_code`,
  `handover_attempts`, `handover_locked_until`, `agreed_price_idr` (integer, null), `claimed_at`,
  `completed_at`, `last_wave_at`, `wave_count`. Kolom lama `collector_name`/`collector_phone` dihapus dari
  pemakaian; dashboard membaca info pengepul lewat fungsi SQL `security definer` yang hanya membuka
  nama, nomor, dan rating rata-rata pengepul untuk laporan milik pemanggil.
- `problem_reports`: `id`, `submission_id`, `owner_id`, `message`, `created_at`, `resolved_at`.
- Kolom rating (`collector_rating`, `collector_review`, `rated_at`) sudah dipakai di interface dashboard
  tetapi **tidak ada di migrasi mana pun**. Buat migrasinya di sini (`add column if not exists`).

**Keamanan (RLS)**
- Hapus policy "Update own submissions". Pembatalan dan laporan masalah lewat route server.
  Pemilik hanya boleh mengisi kolom rating saat `completed`.
- Policy insert ditambah syarat `collector_id is null and agreed_price_idr is null`.
- Tabel pengepul, offer, langganan push, log, dan laporan masalah tidak bisa diakses `anon`/`authenticated`
  langsung. Semua aksi pengepul dan admin lewat server dengan kunci secret plus pengecekan token/role.
- Token: 32 byte acak (base64url), hanya hash SHA-256 yang disimpan. Link `/p/` bisa di-reset admin.
- `handover_code` hanya terbaca oleh pemiliknya, dicek di server, tidak pernah dikirim ke halaman pengepul.
- Halaman `/debug` dan aksinya dihapus.

### 5.6 Admin

`/admin/pengepul` (hanya role admin):
- Daftar pengepul: nama, nomor, wilayah, aktif/jeda, notifikasi aktif atau belum, rating, jumlah selesai.
- Tambah/ubah pengepul (nama, nomor, wilayah di peta), nonaktifkan, reset link, salin link `/p/` untuk
  dikirim manual lewat WA pribadi (sekali saja saat pendaftaran).
- Daftar "Belum terambil" dan "Laporan masalah", dengan tombol tandai selesai ditangani.

### 5.7 Penjadwal

`POST /api/cron/dispatch` (tiap 5 menit: gelombang berikutnya + coba ulang notifikasi gagal) dan
`POST /api/cron/digest` (08.00 dan 16.00 WIB), dilindungi header `x-cron-secret`. Dipanggil dari crontab
VPS dengan `curl`. Keduanya idempoten.

### 5.8 Variabel lingkungan baru

`SUPABASE_SECRET_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
(`mailto:` alamat tim), `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`, `ADMIN_EMAIL`,
`CRON_SECRET`, `APP_BASE_URL`. Semua kecuali VAPID publik khusus server.

## 6. Keputusan builder (bisa dikoreksi)

- `accepted` langsung ke `completed` saat kode benar. Status `picked_up` tidak dipakai alur baru.
- Angka awal: 3 pengepul per gelombang, 30 menit per gelombang, maksimal 3 gelombang, radius 1-30 km,
  di satu file konstanta.
- `pickup_district` dari reverse geocoding Geoapify (`suburb`, lalu `district`, lalu `city`). Gagal: kosong,
  halaman pengepul menampilkan jarak saja.
- Nomor WA divalidasi dan dinormalisasi ke format `62...`.
- Notifier `console` dipakai otomatis saat VAPID atau SMTP kosong (pengembangan lokal).
- Gagal kirim notifikasi tidak menggagalkan laporan: dicatat di `notification_log` dan dicoba ulang cron.
- Dependensi baru: `web-push` (sesuai panduan resmi Next.js) dan `nodemailer`.

## 7. Diserahkan ke builder

Struktur file per fitur, detail tampilan mengikuti `AGENTS.md`, teks notifikasi final, dan pengujian.

## 8. Yang harus disiapkan tim (di luar kode)

- Kunci VAPID (`pnpm dlx web-push generate-vapid-keys`).
- Akun SMTP (mis. Gmail khusus Kasitronik dengan app password).
- Kunci secret Supabase dan role admin untuk akun tim.
- Crontab di VPS untuk dua endpoint penjadwal.
