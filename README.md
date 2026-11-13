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

### Dashboard admin

- Halaman terpisah di `/admin`.
- Admin otomatis diarahkan ke dashboard admin setelah login.
- Admin dapat melihat laporan pending, foto, detail, dan lokasi.
- Admin dapat menerima laporan atau menolaknya.
- Penolakan menyediakan pilihan alasan dan kolom keterangan tambahan.
- Aksi review dilindungi oleh role admin di database, bukan hanya tombol pada tampilan.

## Yang Belum Dibuat

- Integrasi WhatsApp otomatis ke pengepul.
- Dashboard pengepul, magic link klaim order, dan distribusi order.
- Pengiriman notifikasi status ke warga.
- Harga otomatis atau optimasi rute penjemputan.


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
