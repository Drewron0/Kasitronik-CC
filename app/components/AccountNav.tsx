"use client";

import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { logoutAction } from "../actions/logout.action";
import styles from "./Header.module.css";

export default function AccountNav() {
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Handle click outside and Escape key to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function handleMouseEnter() {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsOpen(true);
  }

  function handleMouseLeave() {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  }

  async function handleLogout() {
    setLoading(true);
    setError("");

    const result = await logoutAction();
    setLoading(false);

    if (!result.success && result.error) {
      setError(result.error);
    } else {
      setIsOpen(false);
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
        <div
          ref={dropdownRef}
          className={styles.accountDropdownContainer}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            type="button"
            className={styles.accountDropdownTrigger}
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-haspopup="true"
            aria-label="Menu akun pengguna"
          >
            <span className={styles.accountGreeting}>
              Halo, <strong className={styles.accountDisplayName}>{displayName}</strong>
            </span>
            <svg
              className={`${styles.accountChevron} ${isOpen ? styles.accountChevronRotated : ""}`}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <div
            className={`${styles.accountDropdownMenu} ${isOpen ? styles.accountDropdownOpen : ""}`}
            role="menu"
            aria-orientation="vertical"
          >
            <div className={styles.dropdownHeader}>
              <span className={styles.dropdownName}>{displayName}</span>
              <span className={styles.dropdownEmail}>{user.email}</span>
            </div>

            <div className={styles.dropdownDivider} role="separator" />

            <Link
              href="/dashboard"
              className={styles.dropdownItem}
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="7" height="9" />
                <rect x="14" y="3" width="7" height="5" />
                <rect x="14" y="12" width="7" height="9" />
                <rect x="3" y="16" width="7" height="5" />
              </svg>
              <span>Dashboard Saya</span>
            </Link>

            <Link
              href="/reports/new"
              className={styles.dropdownItem}
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              <span>Submit laporan</span>
            </Link>

            <div className={styles.dropdownDivider} role="separator" />

            <button
              type="button"
              className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
              role="menuitem"
              onClick={handleLogout}
              disabled={loading}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>{loading ? "Keluar..." : "Keluar"}</span>
            </button>
          </div>
        </div>
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
