import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import DebugView from "./components/DebugView";
import styles from "./debug.module.css";

export const metadata: Metadata = {
  title: "Debug",
  description: "Halaman pengujian UI pengepul, rating, dan status laporan Kasitronik.",
};

export default function DebugPage() {
  return (
    <div className={styles.page}>
      <Header />
      <DebugView />
      <Footer showBackToTop={false} />
    </div>
  );
}
