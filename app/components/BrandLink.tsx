"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import styles from "./Header.module.css";

export default function BrandLink() {
  const [href, setHref] = useState("/");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHref(session ? "/dashboard" : "/");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHref(session ? "/dashboard" : "/");
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Link
      href={href}
      className={styles.brand}
      aria-label={href === "/dashboard" ? "Kasitronik dashboard" : "Kasitronik beranda"}
    >
      <Image
        src="/logo.svg"
        alt="Kasitronik"
        width={36}
        height={36}
        className={styles.brandLogo}
        priority
      />
      <span>Kasitronik</span>
    </Link>
  );
}
