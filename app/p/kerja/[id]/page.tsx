import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import JobPageLoader from "@/app/collector/components/JobPageLoader";
import { collectorMetadata } from "@/app/collector/collector-metadata";
import styles from "@/app/collector/collector.module.css";

export const metadata: Metadata = {
  title: "Detail Laporan",
  description: "Detail laporan barang untuk dijemput.",
  ...collectorMetadata,
};

export default function CollectorJobPage({ params }: PageProps<"/p/kerja/[id]">) {
  return (
    <div className={styles.page}>
      <Header variant="minimal" />
      <main className={styles.main}>
        <Suspense fallback={<p className={styles.muted}>Memuat laporan...</p>}>
          <JobPageLoader jobRef={params.then(({ id }) => ({ submissionId: id }))} />
        </Suspense>
      </main>
      <Footer showBackToTop={false} />
    </div>
  );
}
