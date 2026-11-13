"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import EyeIcon from "@/app/components/icons/EyeIcon";
import EyeOffIcon from "@/app/components/icons/EyeOffIcon";
import EnvelopeIcon from "@/app/components/icons/EnvelopeIcon";
import AlertCircleIcon from "@/app/components/icons/AlertCircleIcon";
import { registerAction } from "../actions/register.action";
import GoogleSignInButton from "@/app/components/GoogleSignInButton";
import styles from "../../login/login.module.css";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);

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
    setAlreadyRegistered(false);

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
      setMessage("Konfirmasi kata sandi tidak cocok.");
      setIsError(true);
      return;
    }

    setLoading(true);

    const result = await registerAction({ name, email, password });
    setLoading(false);

    if (!result.success) {
      setMessage(result.error ?? "Pendaftaran gagal.");
      setIsError(true);
      setAlreadyRegistered(Boolean(result.alreadyRegistered));
      return;
    }

    setConfirmedEmail(email);
  }

  if (confirmedEmail) {
    return (
      <section className={styles.card} aria-labelledby="confirm-title">
        <div className={styles.confirmState}>
          <div className={styles.confirmIconWrap} aria-hidden="true">
            <EnvelopeIcon size={30} />
          </div>
          <p className={styles.eyebrow}>KONFIRMASI EMAIL</p>
          <h2 id="confirm-title" className={styles.confirmTitle}>
            Periksa Email Anda
          </h2>
          <p className={styles.confirmText}>
            Tautan konfirmasi telah dikirim ke <strong>{confirmedEmail}</strong>. Silakan periksa kotak masuk atau spam dan klik tautan untuk mengaktifkan akun Anda.
          </p>

          <Link
            href="/login"
            className={styles.submitButton}
            style={{ textDecoration: "none" }}
          >
            Lanjut ke Halaman Masuk
          </Link>

          <button
            type="button"
            className={styles.secondaryAction}
            onClick={() => setConfirmedEmail(null)}
          >
            Daftar dengan email lain
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.card} aria-labelledby="register-title">
      <div className={styles.cardHeading}>
        <p className={styles.eyebrow}>PENDAFTARAN</p>
        <h2 id="register-title">Buat akun baru</h2>
        <p>Lengkapi formulir untuk memulai.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.socialAuth}>
          <GoogleSignInButton />
        </div>

        <div className={styles.divider}>
          <span>atau daftar dengan email</span>
        </div>

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
          <div
            className={`${styles.alert} ${!isError ? styles.alertSuccess : ""}`}
            role={isError ? "alert" : "status"}
          >
            <AlertCircleIcon size={18} className={styles.alertIcon} />
            <div className={styles.alertBody}>
              <span className={styles.alertText}>{message}</span>
              {alreadyRegistered && (
                <Link href="/login" className={styles.alertLink}>
                  Masuk ke akun sekarang
                </Link>
              )}
            </div>
          </div>
        )}

        <p className={styles.switchAccount}>
          Sudah punya akun? <Link href="/login">Masuk</Link>
        </p>
      </form>
    </section>
  );
}
