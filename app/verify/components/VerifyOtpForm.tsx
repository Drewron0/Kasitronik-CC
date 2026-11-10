"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOtpAction } from "../actions/verify-otp.action";
import { supabase } from "@/lib/supabase";
import styles from "../../login/login.module.css";

export default function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialEmail = searchParams.get("email") || "";
  const initialToken = searchParams.get("token") || searchParams.get("code") || "";
  const tokenHash = searchParams.get("token_hash") || "";

  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState(initialToken);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // If activation link with token_hash is clicked directly from email
  useEffect(() => {
    async function handleAutoVerify() {
      if (tokenHash) {
        setLoading(true);
        setMessage("Memverifikasi link aktivasi...");
        setIsError(false);

        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "email",
        });

        setLoading(false);
        if (error) {
          setMessage(error.message);
          setIsError(true);
        } else {
          setMessage("Verifikasi berhasil! Mengalihkan ke beranda...");
          setTimeout(() => router.replace("/"), 1200);
        }
      }
    }

    handleAutoVerify();
  }, [tokenHash, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    if (!email.trim()) {
      setMessage("Masukkan alamat email Anda.");
      setIsError(true);
      return;
    }

    if (!token.trim() || token.trim().length < 6) {
      setMessage("Masukkan 6 digit kode OTP yang dikirim ke email Anda.");
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);

    const result = await verifyOtpAction({
      email: email.trim(),
      token: token.trim(),
      type: "email",
    });

    setLoading(false);

    if (!result.success) {
      setMessage(result.error ?? "Verifikasi gagal.");
      setIsError(true);
      return;
    }

    setMessage(result.message ?? "Verifikasi berhasil! Mengalihkan...");
    setIsError(false);

    setTimeout(() => {
      router.replace("/");
    }, 1200);
  }

  async function handleResend() {
    if (!email.trim() || resending) {
      setMessage("Masukkan email untuk mengirim ulang kode.");
      setIsError(true);
      return;
    }

    setResending(true);
    setMessage("");

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
    });

    setResending(false);

    if (error) {
      setMessage("Gagal mengirim ulang kode: " + error.message);
      setIsError(true);
    } else {
      setMessage("Kode verifikasi baru telah dikirim ke email Anda.");
      setIsError(false);
    }
  }

  return (
    <section className={styles.card} aria-labelledby="verify-title">
      <div className={styles.cardHeading}>
        <p className={styles.eyebrow}>VERIFIKASI EMAIL</p>
        <h2 id="verify-title">Konfirmasi Akun</h2>
        <p>Masukkan 6 digit kode OTP yang kami kirimkan ke email Anda.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="verify-email">Email</label>
          <input
            id="verify-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="verify-otp">Kode OTP (6 digit)</label>
          <input
            id="verify-otp"
            name="token"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={8}
            placeholder="• • • • • •"
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\s+/g, ""))}
            style={{
              letterSpacing: "8px",
              textAlign: "center",
              fontSize: "20px",
              fontWeight: 600,
              fontFamily: "var(--font-geist-mono), monospace",
            }}
            required
          />
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? "Memverifikasi..." : "Verifikasi Akun"}
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", fontSize: "13px" }}>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            style={{
              background: "none",
              border: "none",
              color: "var(--green)",
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
              fontFamily: "inherit",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            {resending ? "Mengirim ulang..." : "Kirim ulang kode"}
          </button>

          <Link
            href="/login"
            style={{
              color: "var(--muted)",
              textDecoration: "none",
            }}
          >
            Kembali ke Masuk
          </Link>
        </div>

        {message && (
          <p
            className={styles.message}
            role={isError ? "alert" : "status"}
            style={{ color: isError ? "#a12d24" : "var(--green)" }}
          >
            {message}
          </p>
        )}
      </form>
    </section>
  );
}
