"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import styles from "../page.module.css";

export default function AccountNav() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signOut({
        scope: "local",
      });

      if (error) {
        setError("Gagal keluar. Silakan coba lagi.");
      }
    } catch {
      setError("Tidak dapat menghubungi server.");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return (
      <span className={styles.accountStatus} role="status">
        Memuat akun...
      </span>
    );
  }

  const fullName = user?.user_metadata?.full_name;
  const displayName =
    typeof fullName === "string" && fullName.trim()
      ? fullName.trim()
      : user?.email?.split("@")[0] || "Pengguna";

  return (
    <div className={styles.accountNav}>
      {user ? (
        <>
          <span className={styles.accountName} title={displayName}>
            Halo, <strong>{displayName}</strong>
          </span>

          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
            disabled={loading}
          >
            {loading ? "Keluar..." : "Keluar"}
          </button>
        </>
      ) : (
        <>
          <Link href="/login" className={styles.loginButton}>
            Masuk
          </Link>
          <Link href="/register" >Daftar</Link>
        </>
      )}

      {error && (
        <span className={styles.accountError} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}