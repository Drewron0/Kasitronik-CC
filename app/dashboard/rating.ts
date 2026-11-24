import { formatRupiah } from "../../lib/notifications/format.ts";
import type { RatingValidation } from "./interfaces/rating-validation.type.ts";

export const REVIEW_MAX = 500;

export function parseRating(input: { rating?: unknown; review?: unknown }): RatingValidation {
  const rating = input.rating;
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "Pilih rating 1 sampai 5." };
  }
  const review = typeof input.review === "string" ? input.review.trim() : "";
  if (review.length > REVIEW_MAX) return { ok: false, error: `Ulasan maksimal ${REVIEW_MAX} karakter.` };
  return { ok: true, rating, review };
}

export function formatPriceLabel(price: number | null): string {
  return price === null ? "Diberikan gratis" : formatRupiah(price);
}
