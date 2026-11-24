# Kasitronik

Kasitronik adalah web untuk melaporkan barang elektronik bekas agar dapat ditinjau dan diproses untuk penjemputan. Warga dapat mengirim foto, detail barang, serta lokasi; admin meninjau laporan sebelum menentukan apakah laporan diterima atau ditolak.

## Tech Stack

| Bagian | Teknologi |
| --- | --- |
| Frontend dan backend web | Next.js 16, React 19, TypeScript |
| Tampilan | CSS Modules dan Geist |
| Autentikasi | Supabase Auth (email/password dan Google OAuth) |
| Database | Supabase PostgreSQL dengan Row Level Security (RLS) |
| Penyimpanan foto | Supabase Storage |
| AI saran barang | Google Gemini melalui `@google/genai` |
| Peta | Leaflet 1.9 dan Geoapify Maps/Address Autocomplete |
| Pengolahan foto | Sharp |
| Package manager | pnpm |
| Pemeriksaan kode | ESLint dan Node test runner |

## Fitur yang Sudah Selesai

### Akun dan keamanan

- Daftar dan masuk menggunakan email/password.
- Verifikasi email menggunakan kode OTP atau tautan konfirmasi.
- Masuk dengan Google OAuth setelah provider Google dikonfigurasi di Supabase.
- Pesan yang jelas untuk email yang telah terdaftar.
- Pengguna biasa hanya dapat membaca laporan miliknya sendiri dan membatalkan laporan yang masih pending.

### Laporan e-waste

- Upload satu foto JPEG atau PNG, maksimal 5 MB.
- Form kategori, nama, merek/tipe, kondisi, jumlah, berat, dan catatan.
- Saran detail barang dari foto menggunakan Gemini; pengguna tetap dapat mengubah seluruh saran.
- Validasi foto, ukuran, detail form, dan pembatasan percobaan AI.
- Foto dinormalisasi sebelum disimpan ke Storage.

### Lokasi penjemputan

- Pencarian alamat melalui Geoapify.
- Peta Leaflet dengan pin yang dapat dipilih atau digeser.
- Tombol lokasi perangkat jika pengguna mengizinkan akses lokasi.
- Alamat lengkap, patokan, dan konfirmasi titik sebelum laporan dikirim.

### Dashboard warga

- Riwayat laporan pribadi dengan filter dan pencarian.
- Status proses laporan.
- Detail laporan serta alasan penolakan jika laporan ditolak.
- Pembatalan laporan yang masih pending.


## Yang Belum Dibuat

- Integrasi WhatsApp otomatis ke pengepul.
- Dashboard pengepul, magic link klaim order, dan distribusi order.
- Pengiriman notifikasi status ke warga.
- Harga otomatis atau optimasi rute penjemputan.


## Alur Pengepul

Pengepul tidak punya akun. Tim mendaftarkan mereka di `/admin/pengepul`, lalu mengirim link pribadi `/p/<token>` lewat WhatsApp sekali saja. Laporan baru dikirim sebagai notifikasi HP (web push) ke 3 pengepul terdekat per gelombang, tiap 30 menit, maksimal 3 gelombang. Warga menerima kabar lewat email dan menyerahkan barang dengan kode 4 angka.

### Persiapan

1. Jalankan migrasi `supabase/migrations/202611240001_collectors.sql` di SQL editor Supabase.
2. Buat kunci VAPID: `pnpm dlx web-push generate-vapid-keys`.
3. Isi semua variabel di bagian "Pengepul flow" pada `.env.example` (lokal di `.env`, produksi sebagai GitHub Secrets dengan nama yang sama).
4. Jadikan akun tim sebagai admin: di Supabase, Authentication > Users > pilih akun > App Metadata, isi `{"role": "admin"}`.
5. Pasang crontab di VPS (ganti `RAHASIA` dengan nilai `CRON_SECRET`):

```
*/5 * * * * curl -fsS -X POST -H "x-cron-secret: RAHASIA" https://kasitronik.ourprojects.my.id/api/cron/dispatch
0 1,9 * * * curl -fsS -X POST -H "x-cron-secret: RAHASIA" https://kasitronik.ourprojects.my.id/api/cron/digest
```

Jadwal `1,9` dalam UTC sama dengan 08.00 dan 16.00 WIB. Tanpa kredensial VAPID atau SMTP, notifikasi hanya dicetak ke log server.

## Pembagian Tugas

### Nathan

- Melakukan deployment aplikasi.
- Mengembangkan dan mengurus antarmuka pengguna.

### Aaron

- Mengurus konfigurasi dan alur CI/CD.
- Mengembangkan dashboard pengguna.

### Jermy

- Menghubungkan aplikasi dengan Gemini API.
- Mengembangkan dan mengurus integrasi Supabase.
