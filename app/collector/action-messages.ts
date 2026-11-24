import type { ClaimResult } from "../../lib/collector/interfaces/claim-result.type.ts";
import type { CompleteResult } from "../../lib/collector/interfaces/complete-result.type.ts";
import type { ReleaseResult } from "../../lib/collector/interfaces/release-result.type.ts";
import type { ActionResult } from "./interfaces/action-result.type.ts";

export const INVALID_LINK: ActionResult = { ok: false, error: "Link tidak berlaku. Minta link baru ke tim Kasitronik." };
const NOT_YOURS: ActionResult = { ok: false, error: "Laporan ini bukan milik Anda lagi." };

/** Formats an instant as HH.MM in Western Indonesia Time. */
export function wibTime(iso: string): string {
  const parts = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? "00";
  return `${get("hour")}.${get("minute")}`;
}

export function claimMessage(result: ClaimResult): ActionResult {
  switch (result.kind) {
    case "claimed": return { ok: true };
    case "taken": return { ok: false, error: "Laporan ini sudah diambil pengepul lain." };
    case "closed": return { ok: false, error: "Laporan ini sudah ditutup." };
    case "not_found": return { ok: false, error: "Laporan tidak ditemukan." };
  }
}

export function completeMessage(result: CompleteResult): ActionResult {
  switch (result.kind) {
    case "completed": return { ok: true };
    case "wrong_code": return { ok: false, field: "code", error: `Kode salah. Sisa ${result.attemptsLeft} percobaan.` };
    case "locked": return { ok: false, field: "code", error: `Terlalu banyak kode salah. Coba lagi pukul ${wibTime(result.lockedUntil)} WIB.` };
    case "invalid_price": return { ok: false, field: "price", error: "Isi harga dalam rupiah, contoh 150000." };
    case "not_yours": return NOT_YOURS;
  }
}

export function releaseMessage(result: ReleaseResult): ActionResult {
  return result.kind === "released" ? { ok: true } : NOT_YOURS;
}
