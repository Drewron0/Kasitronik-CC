"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import styles from "./login.module.css";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
const router = useRouter();
const [loading, setLoading] = useState(false);
 async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  if (loading) return;

  setMessage("");

  const formData = new FormData(event.currentTarget);
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  setLoading(true);

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(
        error.code === "email_not_confirmed"
          ? "Konfirmasi email terlebih dahulu sebelum masuk."
          : "Login gagal. Periksa email dan kata sandi, lalu coba lagi."
      );
      return;
    }

    router.replace("/");
  } catch {
    setMessage("Tidak dapat menghubungi server. Coba lagi.");
  } finally {
    setLoading(false);
  }
}

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            e
          </span>
          E-Waste
        </Link>

        <nav className={styles.authNav} aria-label="Navigasi utama">
  <Link href="/" className={styles.backLink}>
    Beranda
  </Link>

  <Link
    href="/login"
    className={styles.backLink}
    aria-current="page"
  >
    Masuk
  </Link>

  <Link href="/register" className={styles.backLink}>
    Daftar
  </Link>
</nav>
</header>
      <div className={styles.content}>
        <section className={styles.introduction}>
          <p className={styles.eyebrow}>LANGKAH KECIL, MULAI DARI RUMAH</p>

          <h1>
            Barang lama.
            <br />
            <span>Cerita berikutnya.</span>
          </h1>

          <p className={styles.description}>
            Masuk untuk mengelola laporan elektronik dan mengikuti proses
            pengambilannya.
          </p>

          <div className={styles.reminder}>
            <span className={styles.reminderNumber} aria-hidden="true">
              01
            </span>
            <div>
              <strong>Mulai dari satu perangkat.</strong>
              <p>
                Siapkan foto dan catatan kondisi barang yang sudah tidak
                digunakan.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.card} aria-labelledby="login-title">
          <div className={styles.cardHeading}>
            <p className={styles.eyebrow}>AKUN E-WASTE</p>
            <h2 id="login-title">Selamat datang kembali.</h2>
            <p>Masukkan email dan kata sandi akunmu.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="nama@email.com"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password">Kata sandi</label>

              <div className={styles.passwordField}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Masukkan kata sandi"
                  required
                />

                <button
                  type="button"
                  className={styles.passwordToggle}
                  aria-label="Tampilkan kata sandi"
                  aria-pressed={showPassword}
                  aria-controls="password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Sembunyikan" : "Lihat"}
                </button>
              </div>
            </div>

            <button
  type="submit"
  className={styles.submitButton}
  disabled={loading}
>
  {loading ? "Memproses..." : "Masuk"}
</button>

            <p className={styles.message} role="status">
  {message}
</p>

<p className={styles.switchAccount}>
  Belum punya akun? <Link href="/register">Daftar</Link>
</p>
</form>

          <div className={styles.developmentNote}>
            <span className={styles.dot} aria-hidden="true" />
            <p>
              Pratinjau halaman. Login, pendaftaran, dan pemulihan kata sandi
              belum tersedia.
            </p>
          </div>
        </section>
      </div>

      <footer className={styles.footer}>
        Proyek Cloud Computing · Kelompok 1
      </footer>
    </main>
  );
}