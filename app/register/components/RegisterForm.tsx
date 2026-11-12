"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EyeIcon from "@/app/components/icons/EyeIcon";
import EyeOffIcon from "@/app/components/icons/EyeOffIcon";
import { registerAction } from "../actions/register.action";
import styles from "../../login/login.module.css";

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const isPasswordSecure = hasMinLength && hasUpperCase && hasNumber && hasSymbol;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setMessage("");
    setIsError(false);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const confirmation = String(formData.get("confirmation") ?? "");

    if (!name) {
      setMessage("Nama lengkap wajib diisi.");
      setIsError(true);
      return;
    }

    if (!isPasswordSecure) {
      setMessage("Kata sandi belum memenuhi kriteria keamanan.");
      setIsError(true);
      return;
    }

    if (password !== confirmation) {
      setMessage("Konfirmasi kata sandi belum cocok.");
      setIsError(true);
      return;
    }

    setLoading(true);

    const result = await registerAction({ name, email, password });
    setLoading(false);

    if (!result.success) {
      setMessage(result.error ?? "Pendaftaran gagal.");
      setIsError(true);
      return;
    }

    setMessage(result.message ?? "Pendaftaran berhasil. Mengarahkan ke halaman masuk...");
    setIsError(false);
    setPassword("");
    form.reset();

    setTimeout(() => {
      router.push("/login?registered=true");
    }, 700);
  }

  return (
    <section className={styles.card} aria-labelledby="register-title">
      <div className={styles.cardHeading}>
        <p className={styles.eyebrow}>PENDAFTARAN</p>
        <h2 id="register-title">Buat akun baru</h2>
        <p>Lengkapi formulir untuk memulai.</p>
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
              placeholder="Masukkan kata sandi aman"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              className={styles.passwordToggle}
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          {password.length > 0 && (
            <div className={styles.passwordCriteria} aria-live="polite">
              <span className={hasMinLength ? styles.criterionMet : styles.criterionUnmet}>
                {hasMinLength ? "✓" : "○"} Min. 8 karakter
              </span>
              <span className={hasUpperCase ? styles.criterionMet : styles.criterionUnmet}>
                {hasUpperCase ? "✓" : "○"} Huruf besar
              </span>
              <span className={hasNumber ? styles.criterionMet : styles.criterionUnmet}>
                {hasNumber ? "✓" : "○"} Angka
              </span>
              <span className={hasSymbol ? styles.criterionMet : styles.criterionUnmet}>
                {hasSymbol ? "✓" : "○"} Simbol
              </span>
            </div>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="confirmation">Konfirmasi kata sandi</label>
          <input
            id="confirmation"
            name="confirmation"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Ulangi kata sandi"
            required
          />
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? "Mendaftarkan..." : "Daftar"}
        </button>

        {message && (
          <p
            className={styles.message}
            role={isError ? "alert" : "status"}
            style={{ color: isError ? "#a12d24" : "var(--green)" }}
          >
            {message}
          </p>
        )}

        <p className={styles.switchAccount}>
          Sudah punya akun? <Link href="/login">Masuk</Link>
        </p>
      </form>
    </section>
  );
}
