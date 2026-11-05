"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "../../lib/supabase";
import styles from "../login/login.module.css";
import Link from "next/link";


export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (loading) return;

        setMessage("");

        const form = event.currentTarget;
        const formData = new FormData(form);

        const name = String(formData.get("name") ?? "").trim();
        const email = String(formData.get("email") ?? "").trim();
        const password = String(formData.get("password") ?? "");
        const confirmation = String(formData.get("confirmation") ?? "");

        if (!name) {
            setMessage("Nama lengkap wajib diisi.");
            return;
        }

        if (password.length < 8) {
            setMessage("Kata sandi minimal 8 karakter.");
            return;
        }

        if (password !== confirmation) {
            setMessage("Konfirmasi kata sandi belum cocok.");
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                    },
                    emailRedirectTo: `${window.location.origin}/login`,
                },
            });

            if (error) {
                setMessage(error.message);
                return;
            }

            setMessage(
                data.session
                    ? "Akun berhasil dibuat dan sesi login sudah aktif."
                    : "Periksa email untuk konfirmasi pendaftaran. Jika akun sudah terdaftar, gunakan halaman Masuk."
            );

            form.reset();
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

  <Link href="/login" className={styles.backLink}>
    Masuk
  </Link>

  <Link
    href="/register"
    className={styles.backLink}
    aria-current="page"
  >
    Daftar
  </Link>
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

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? "Mendaftarkan..." : "Buat akun"}
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