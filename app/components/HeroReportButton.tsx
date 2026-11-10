"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "../page.module.css";

export default function HeroReportButton() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(Boolean(session));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
    });

    return () => subscription.unsubscribe();
  }, []);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    if (isAuthenticated) {
      router.push("/reports/new");
    } else {
      router.push("/register?redirectTo=/reports/new");
    }
  }

  const destination = isAuthenticated
    ? "/reports/new"
    : "/register?redirectTo=/reports/new";

  return (
    <a
      href={destination}
      onClick={handleClick}
      className={styles.primaryButton}
    >
      Siapkan laporan
    </a>
  );
}
