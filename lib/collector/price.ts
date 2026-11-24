import { PRICE_MAX_IDR } from "./rules.ts";

/** Parses an agreed price in rupiah. Empty means given for free (null). */
export function parsePriceIdr(input: string): number | null | "invalid" {
  const cleaned = input.trim().replace(/^rp\.?\s*/i, "");
  if (!cleaned) return null;
  if (!/^[0-9]{1,3}([.,][0-9]{3})*$|^[0-9]+$/.test(cleaned)) return "invalid";
  const value = Number(cleaned.replace(/[.,]/g, ""));
  return Number.isSafeInteger(value) && value <= PRICE_MAX_IDR ? value : "invalid";
}
