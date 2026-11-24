import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import AdminView from "../components/AdminView";
import styles from "../admin.module.css";

export const metadata: Metadata = {
  title: "Kelola Pengepul",
  description: "Tambah pengepul, atur wilayah, dan tangani laporan yang belum terambil.",
  robots: { index: false, follow: false },
};

export default function AdminCollectorsPage() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Kelola pengepul</h1>
        <AdminView />
      </main>
      <Footer showBackToTop={false} />
    </div>
  );
}
