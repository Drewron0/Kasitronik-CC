import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import DashboardView from "./components/DashboardView";
import styles from "./dashboard.module.css";

export const metadata: Metadata = {
  title: "Dashboard Saya",
  description: "Pantau status verifikasi, penjemputan, dan riwayat laporan barang elektronik bekas Anda di Kasitronik.",
};

export default function DashboardPage() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <DashboardView />
      </main>
      <Footer showBackToTop={false} />
    </div>
  );
}
