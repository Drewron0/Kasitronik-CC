import Link from "next/link";
import AccountNav from "./AccountNav";
import BrandLink from "./BrandLink";
import type { HeaderProps } from "../interfaces/header-props.interface";
import styles from "./Header.module.css";

export default function Header({
  variant = "home",
  currentAuthPage,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <BrandLink />

        {variant === "auth" ? (
          <nav className={styles.nav} aria-label="Navigasi akun">
            <Link href="/" className={styles.navLink}>
              Beranda
            </Link>
            <Link
              href="/login"
              className={
                currentAuthPage === "login"
                  ? `${styles.navLink} ${styles.navLinkActive}`
                  : styles.navLink
              }
              aria-current={currentAuthPage === "login" ? "page" : undefined}
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className={
                currentAuthPage === "register"
                  ? `${styles.navLink} ${styles.navLinkActive}`
                  : styles.navLink
              }
              aria-current={currentAuthPage === "register" ? "page" : undefined}
            >
              Daftar
            </Link>
          </nav>
        ) : (
          <nav className={styles.nav} aria-label="Navigasi utama">
            <Link href="/#alur" className={`${styles.navLink} ${styles.desktopOnly}`}>
              Cara kerja
            </Link>
            <Link href="/#persiapan" className={`${styles.navLink} ${styles.desktopOnly}`}>
              Panduan
            </Link>
            <AccountNav />
          </nav>
        )}
      </div>
    </header>
  );
}
