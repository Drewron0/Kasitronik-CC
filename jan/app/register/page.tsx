"use client";

import { useState, type FormEvent } from "react";

import styles from "../login/login.module.css";
import Link from "next/link";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const password = data.get("password");
    const confirmation = data.get("confirmation");

    if (password !== confirmation) {
      setMessage("Konfirmasi kata sandi belum cocok.");
      return;
    }

    setMessage(
      "Pendaftaran belum tersedia. Formulir belum terhubung ke Supabase."
    );
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

        <nav className={styles.nav} aria-label="Navigasi utama">
  <a href="#alur">Cara kerja</a>
  <a href="#persiapan">Panduan barang</a>
  <Link href="/login">Masuk</Link>
  <Link href="/register">Daftar</Link>
</nav>
      </header>

      <div className={styles.content}>
        <section className={styles.introduction}>
          <p className={styles.eyebrow}>MULAI DARI SATU LANGKAH</p>

          <h1>
            Ruang lebih lega.
            <br />
            <span>Barang lebih berguna.</span>
          </h1>

          <p className={styles.description}>
            Buat akun untuk melaporkan elektronik yang tidak terpakai
            dan mengikuti proses pengambilannya.
          </p>

          <div className={styles.reminder}>
            <span className={styles.reminderNumber} aria-hidden="true">
              01
            </span>
            <div>
              <strong>Satu akun untuk laporanmu.</strong>
              <p>
                Kelola detail barang dan pantau status pengambilan
                dari tempat yang sama.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.card} aria-labelledby="register-title">
          <div className={styles.cardHeading}>
            <p className={styles.eyebrow}>AKUN E-WASTE</p>
            <h2 id="register-title">Buat akunmu.</h2>
            <p>Isi nama, email, dan kata sandi untuk mendaftar.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="name">Nama lengkap</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Nama lengkap"
                maxLength={100}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
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
                  autoComplete="new-password"
                  placeholder="Minimal 8 karakter"
                  minLength={8}
                  aria-describedby="password-hint"
                  required
                />

                <button
                  type="button"
                  className={styles.passwordToggle}
                  aria-label="Tampilkan kata sandi"
                  aria-pressed={showPassword}
                  aria-controls="password confirmation"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Sembunyikan" : "Lihat"}
                </button>
              </div>

              <p id="password-hint" className={styles.fieldHint}>
                Gunakan minimal 8 karakter.
              </p>
            </div>

            <div className={styles.field}>
              <label htmlFor="confirmation">Konfirmasi kata sandi</label>
              <input
                id="confirmation"
                name="confirmation"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Ulangi kata sandi"
                minLength={8}
                required
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              Buat akun
            </button>

            <p className={styles.message} role="status">
              {message}
            </p>

            <p className={styles.switchAccount}>
              Sudah punya akun? <Link href="/login">Masuk</Link>
            </p>
          </form>

          <div className={styles.developmentNote}>
            <span className={styles.dot} aria-hidden="true" />
            <p>
              Pratinjau halaman. Akun belum dibuat dan data formulir
              tidak dikirim ke server.
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