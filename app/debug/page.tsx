import type { Metadata } from "next";
import DebugView from "./components/DebugView";

export const metadata: Metadata = {
  title: "Debug Panel",
  description: "Panel pengembang sementara untuk simulasi alur status laporan dan mitra penjemput Kasitronik.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DebugPage() {
  return <DebugView />;
}
