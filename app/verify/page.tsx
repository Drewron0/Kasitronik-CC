import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import VerifyOtpForm from "./components/VerifyOtpForm";
import styles from "../login/login.module.css";

export const metadata: Metadata = {
  title: "Verifikasi Akun",
  description: "Verifikasi akun Kasitronik Anda dengan kode OTP atau link konfirmasi email.",
};

export default function VerifyPage() {
  return (
    <main className={styles.page}>
      <Header variant="auth" />

      <div className={styles.content}>
        <div className={styles.introduction}>
          <p className={styles.eyebrow}>LANGKAH TERAKHIR</p>
          <h1>
            Aktivasi <span>akun Anda.</span>
          </h1>
          <p className={styles.description}>
            Demi keamanan transaksi dan penjemputan sampah elektronik, kami mengirimkan kode verifikasi langsung ke kotak masuk email Anda.
          </p>
        </div>

        <Suspense fallback={<div className={styles.card}>Memuat halaman verifikasi...</div>}>
          <VerifyOtpForm />
        </Suspense>
      </div>

      <Footer showBackToTop={false} />
    </main>
  );
}
