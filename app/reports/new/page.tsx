import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ReportForm from "../components/ReportForm";
import styles from "../reports.module.css";

export const metadata: Metadata = {
  title: "Submit Barang",
  description: "Kirim barang elektronik bekas dengan detail manual atau saran pengisian dari foto melalui AI Kasitronik.",
};

export default function ReportPage() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>SUBMIT BARANG</p>
          <h1>Elektronik lama.<br /><span>Langkah baru.</span></h1>
          <p>Isi detail barang secara manual atau gunakan foto untuk membantu pengisian.</p>
        </div>
        <ReportForm />
      </main>
      <Footer showBackToTop={false} />
    </div>
  );
}
