# Kasitronik

Kasitronik adalah aplikasi untuk mengelola pengumpulan barang elektronik bekas. Pengguna dapat membuat akun, mengirim laporan barang beserta foto dan lokasi penjemputan, serta mendapatkan bantuan pengisian detail barang menggunakan Google Gemini.

## Fitur Utama

- Autentikasi pengguna dengan Supabase.
- Pengiriman laporan barang elektronik bekas.
- Pengunggahan foto barang secara aman.
- Penentuan lokasi penjemputan melalui peta dan pencarian alamat.
- Bantuan AI untuk mengenali dan mengisi detail barang dari foto.
- Penyimpanan data dengan Supabase dan perlindungan Row Level Security.

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
- Mengembangkan dan mengurus antarmuka pengguna (UI).

### Aaron

- Mengurus konfigurasi dan alur CI/CD.
- Mengembangkan UI dan alur kinerja dashboard pengguna.

### Jermy

- Menghubungkan aplikasi dengan Gemini API.
- Mengembangkan dan mengurus integrasi Supabase.
