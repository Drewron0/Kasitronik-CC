"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { logoutAction } from "../actions/logout.action";
import styles from "./Header.module.css";

export default function AccountNav() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    setLoading(true);
    setError("");

    const result = await logoutAction();
    setLoading(false);

    if (!result.success && result.error) {
      setError(result.error);
    }
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
          <Link href="/login" className={styles.navLink}>
            Masuk
          </Link>
          <Link href="/register" className={styles.navLink}>
            Daftar
          </Link>
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
