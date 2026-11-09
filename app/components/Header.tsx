import Image from "next/image";
import Link from "next/link";
import AccountNav from "./AccountNav";
import type { HeaderProps } from "../interfaces/header-props.interface";
import styles from "./Header.module.css";

export default function Header({
  variant = "home",
  currentAuthPage,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.brand} aria-label="Kasitronik beranda">
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
