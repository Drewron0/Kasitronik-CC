/** Normalizes an Indonesian mobile number to the `62...` form, or returns null when it is not one. */
export function normalizeIndonesianPhone(input: string): string | null {
  const trimmed = input.trim();
  if (!/^\+?[0-9\s().-]+$/.test(trimmed)) return null;
  let digits = trimmed.replace(/[^0-9]/g, "");
  if (digits.startsWith("62")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  if (!digits.startsWith("8") || digits.length < 9 || digits.length > 12) return null;
  return `62${digits}`;
}
