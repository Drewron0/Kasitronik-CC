import { normalizeIndonesianPhone } from "../../lib/collector/phone.ts";

export const OWNER_PHONE_ERROR = "Isi nomor WhatsApp yang aktif, contoh 0812 3456 7890.";

export function parseOwnerPhone(form: FormData): { owner_phone: string } {
  const value = form.get("ownerPhone");
  const phone = typeof value === "string" ? normalizeIndonesianPhone(value) : null;
  if (!phone) throw new Error(OWNER_PHONE_ERROR);
  return { owner_phone: phone };
}
