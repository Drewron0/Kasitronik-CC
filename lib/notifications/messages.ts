import type { Collector } from "../collector/interfaces/collector.interface.ts";
import type { SubmissionForCollector } from "../collector/interfaces/submission-for-collector.interface.ts";
import type { EmailMessage } from "./interfaces/email-message.interface.ts";
import type { PushPayload } from "./interfaces/push-payload.interface.ts";
import { conditionLabel, formatKm, formatPhoneDisplay, formatRating, formatRupiah, waLink } from "./format.ts";

const itemLine = (sub: SubmissionForCollector) => `${sub.quantity}x ${sub.itemName}`;
const dashboard = (appUrl: string) => `${appUrl}/dashboard`;

// Never put the address, owner phone or handover code in a collector message.
export function offerPush(sub: SubmissionForCollector, distanceKm: number, url: string): PushPayload {
  return {
    title: sub.district ? `Laporan baru - ${sub.district}` : "Laporan baru di wilayah Anda",
    body: `${itemLine(sub)}, ${conditionLabel(sub.condition)}, ${sub.weightLabel}. ${formatKm(distanceKm)} dari titik wilayah Anda.`,
    url,
    tag: `offer-${sub.id}`,
  };
}

export function digestPush(count: number, url: string): PushPayload {
  return {
    title: "Rangkuman laporan Kasitronik",
    body: `Ada ${count} laporan baru di wilayah Anda.`,
    url,
    tag: "digest",
  };
}

export function cancelledPush(sub: SubmissionForCollector, url: string): PushPayload {
  return {
    title: "Laporan dibatalkan",
    body: `Pemilik membatalkan laporan ${itemLine(sub)}. Tidak perlu menjemput.`,
    url,
    tag: `offer-${sub.id}`,
  };
}

export function ownerClaimedEmail(
  to: string,
  sub: SubmissionForCollector,
  collector: Pick<Collector, "name" | "phone">,
  rating: number | null,
  appUrl: string,
): EmailMessage {
  return {
    to,
    subject: `Laporan ${sub.itemName} sudah diambil pengepul`,
    text: [
      `Laporan ${itemLine(sub)} Anda sudah diambil oleh ${collector.name} (${formatRating(rating)}).`,
      "",
      `Nomor WhatsApp pengepul: ${formatPhoneDisplay(collector.phone)}`,
      `Chat langsung: ${waLink(collector.phone)}`,
      "",
      `Kode serah terima: ${sub.handoverCode ?? "-"}`,
      "Berikan kode ini kepada pengepul hanya saat barang diserahkan.",
      "",
      `Lihat detail: ${dashboard(appUrl)}`,
    ].join("\n"),
  };
}

export function ownerReleasedEmail(to: string, sub: SubmissionForCollector, appUrl: string): EmailMessage {
  return {
    to,
    subject: `Laporan ${sub.itemName} sedang dicarikan pengepul lain`,
    text: [
      `Pengepul sebelumnya melepas laporan ${itemLine(sub)} Anda.`,
      "Kami sedang mencarikan pengepul lain di sekitar lokasi Anda.",
      "",
      `Lihat detail: ${dashboard(appUrl)}`,
    ].join("\n"),
  };
}

export function ownerDoneEmail(to: string, sub: SubmissionForCollector, priceIdr: number | null, appUrl: string): EmailMessage {
  return {
    to,
    subject: `Tanda terima penjemputan ${sub.itemName}`,
    text: [
      `Barang ${itemLine(sub)} sudah dijemput.`,
      priceIdr === null ? "Barang diberikan gratis." : `Harga yang disepakati: ${formatRupiah(priceIdr)}`,
      "",
      `Beri rating pengepul dan lihat tanda terima: ${dashboard(appUrl)}`,
    ].join("\n"),
  };
}

export function adminAlertEmail(
  to: string,
  reason: "unclaimed" | "problem",
  sub: SubmissionForCollector,
  message?: string,
): EmailMessage {
  const where = sub.district || sub.address;
  return reason === "unclaimed"
    ? {
        to,
        subject: `Laporan belum terambil: ${sub.itemName}`,
        text: `Laporan ${itemLine(sub)} di ${where} belum diambil pengepul setelah semua gelombang.\nID laporan: ${sub.id}`,
      }
    : {
        to,
        subject: `Laporan masalah: ${sub.itemName}`,
        text: `Warga melaporkan masalah untuk laporan ${itemLine(sub)} di ${where}.\n\n${message ?? ""}\n\nID laporan: ${sub.id}`,
      };
}
