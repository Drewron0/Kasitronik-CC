import Image from "next/image";
import Link from "next/link";
import type { FooterProps } from "../interfaces/footer-props.interface";
import styles from "./Footer.module.css";

export default function Footer({ showBackToTop = true }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <Link href="/" className={styles.brand} aria-label="Kasitronik beranda">
        <Image
          src="/logo.svg"
          alt="Kasitronik"
          width={28}
          height={28}
          className={styles.brandLogo}
        />
        <span>Kasitronik</span>
      </Link>
      <p className={styles.footerCopyright}>© 2026 Kasitronik. Hak cipta dilindungi.</p>
      {showBackToTop && (
        <a href="#top" className={styles.backLink}>
          Kembali ke atas
        </a>
      )}
    </footer>
  );
}
