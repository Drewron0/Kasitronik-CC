const CONDITION_LABELS: Record<string, string> = {
  working: "masih berfungsi",
  damaged: "rusak sebagian",
  dead: "mati total",
  dismantled: "sudah dibongkar",
};

export function conditionLabel(condition: string): string {
  return CONDITION_LABELS[condition] ?? condition;
}

/** `6281234567890` becomes `0812-3456-7890`. */
export function formatPhoneDisplay(phone: string): string {
  const local = phone.startsWith("62") ? `0${phone.slice(2)}` : phone;
  return [local.slice(0, 4), local.slice(4, 8), local.slice(8)].filter(Boolean).join("-");
}

export function formatKm(km: number): string {
  return `${km.toFixed(1).replace(".", ",")} km`;
}

export function formatRupiah(value: number): string {
  return `Rp ${String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

export function formatRating(rating: number | null): string {
  return rating === null ? "belum ada rating" : `rating ${rating.toFixed(1).replace(".", ",")} dari 5`;
}

/** Shows a WhatsApp link for a phone number in the 62... form. */
export function waLink(phone: string): string {
  return `https://wa.me/${phone}`;
}
