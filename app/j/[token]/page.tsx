import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import JobPageLoader from "@/app/collector/components/JobPageLoader";
import { collectorMetadata } from "@/app/collector/collector-metadata";
import styles from "@/app/collector/collector.module.css";

export const metadata: Metadata = {
  title: "Laporan Baru",
  description: "Laporan barang elektronik bekas yang ditawarkan kepada Anda.",
  ...collectorMetadata,
};

export default function OfferPage({ params }: PageProps<"/j/[token]">) {
  return (
    <div className={styles.page}>
      <Header variant="minimal" />
      <main className={styles.main}>
        <Suspense fallback={<p className={styles.muted}>Memuat laporan...</p>}>
          <JobPageLoader jobRef={params.then(({ token }) => ({ token }))} />
        </Suspense>
      </main>
      <Footer showBackToTop={false} />
    </div>
  );
}
