import { categories } from "../item-details";
import type { SuggestionPreviewProps } from "../interfaces/suggestion-preview-props.interface";
import styles from "../reports.module.css";

export default function SuggestionPreview({ suggestion: s, onApply, onDismiss }: SuggestionPreviewProps) {
  const rows = [
    ["Kategori", s.category ? categories[s.category as keyof typeof categories] : ""],
    ["Nama", s.itemName], ["Merek & tipe", s.brandModel],
    ["Jumlah", s.quantity === null ? "" : `${s.quantity} unit`],
    ["Perkiraan berat per unit", s.weightMinKg === null ? "" : `${s.weightMinKg} - ${s.weightMaxKg} kg`], ["Catatan fisik", s.notes],
  ].filter(([, value]) => value);
  return <section className={styles.suggestions} aria-label="Saran AI">
    <h2>Saran AI</h2>
    {rows.length ? <dl>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl> : <p>Detail belum terbaca. Isi formulir secara manual.</p>}
    <div className={styles.authLinks}>
      <button type="button" className={styles.button} onClick={onApply} disabled={!s.category || !s.itemName.trim()}>Isi kolom yang kosong</button>
      <button type="button" className={styles.secondaryButton} onClick={onDismiss}>Abaikan</button>
    </div>
  </section>;
}
