"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EyeIcon from "@/app/components/icons/EyeIcon";
import EyeOffIcon from "@/app/components/icons/EyeOffIcon";
import { loginAction } from "../actions/login.action";
import type { LoginFormProps } from "../interfaces/login-form-props.interface";
import styles from "../login.module.css";

export default function LoginForm({ initialMessage }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(initialMessage ?? "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setMessage("");
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setLoading(true);

    const result = await loginAction({ email, password });
    setLoading(false);

    if (!result.success) {
      setMessage(result.error ?? "Login gagal.");
      return;
    }

    router.replace("/");
  }

  return (
    <section className={styles.card} aria-labelledby="login-title">
      <div className={styles.cardHeading}>
        <p className={styles.eyebrow}>AKUN</p>
        <h2 id="login-title">Selamat datang kembali</h2>
        <p>Masukkan email dan kata sandi untuk masuk.</p>
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
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
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

        {message && (
          <p className={styles.message} role="alert">
            {message}
          </p>
        )}

        <p className={styles.switchAccount}>
          Belum punya akun? <Link href="/register">Daftar</Link>
        </p>
      </form>
    </section>
  );
}
