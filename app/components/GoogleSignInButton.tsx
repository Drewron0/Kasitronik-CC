"use client";

import { useState } from "react";
import GoogleIcon from "./icons/GoogleIcon";
import { googleSignInAction } from "@/app/auth/actions/google-sign-in.action";
import type { GoogleSignInButtonProps } from "./interfaces/google-sign-in-button-props.interface";
import styles from "./GoogleSignInButton.module.css";

export default function GoogleSignInButton({ redirectTo }: GoogleSignInButtonProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn() {
    if (loading) return;
    setLoading(true); setError("");
    const result = await googleSignInAction(redirectTo);
    if (!result.success || !result.url) {
      setError(result.error ?? "Masuk dengan Google gagal. Coba lagi.");
      setLoading(false);
      return;
    }
    window.location.assign(result.url);
  }

  return <>
    <button type="button" className={styles.button} onClick={signIn} disabled={loading}>
      <GoogleIcon />{loading ? "Mengalihkan ke Google..." : "Lanjutkan dengan Google"}
    </button>
    {error && <p className={styles.message} role="alert">{error}</p>}
  </>;
}
