import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import CollectorHomeLoader from "@/app/collector/components/CollectorHomeLoader";
import { collectorMetadata } from "@/app/collector/collector-metadata";
import styles from "@/app/collector/collector.module.css";

export const metadata: Metadata = {
  title: "Pengepul",
  description: "Laporan barang elektronik bekas di wilayah Anda.",
  ...collectorMetadata,
};

export default function CollectorHomePage() {
  return (
    <div className={styles.page}>
      <Header variant="minimal" />
      <main className={styles.main}>
        <Suspense fallback={<p className={styles.muted}>Memuat laporan...</p>}>
          <CollectorHomeLoader />
        </Suspense>
      </main>
      <Footer showBackToTop={false} />
    </div>
  );
}
