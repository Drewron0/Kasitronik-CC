import { categories, conditions } from "../item-details";
import type { ItemFieldsProps } from "../interfaces/item-fields-props.interface";
import styles from "../reports.module.css";

export default function ItemFields({ details, suggested, onChange }: ItemFieldsProps) {
  const tag = (key: string) => suggested.includes(key) ? <span className={styles.tag}>Saran AI</span> : null;
  return <div className={styles.inputPanel}>
    <label htmlFor="category">Kategori perangkat {tag("category")}</label>
    <select id="category" value={details.category} required onChange={e => onChange("category", e.target.value)}>
      <option value="">Pilih kategori</option>
      {Object.entries(categories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
    </select>
    <label htmlFor="itemName">Nama barang {tag("itemName")}</label>
    <input id="itemName" value={details.itemName} maxLength={120} placeholder="Contoh: TV tabung 21 inch" required onChange={e => onChange("itemName", e.target.value)} />
    <label htmlFor="brandModel">Merek & tipe (opsional) {tag("brandModel")}</label>
    <input id="brandModel" value={details.brandModel} maxLength={160} placeholder="Contoh: Samsung Galaxy A50" onChange={e => onChange("brandModel", e.target.value)} />
    <label htmlFor="quantity">Jumlah unit sejenis {tag("quantity")}</label>
    <input id="quantity" type="number" min="1" max="100" step="1" value={details.quantity} required onChange={e => onChange("quantity", e.target.value)} />
    <fieldset className={styles.conditions}>
      <legend>Kondisi barang</legend>
      {Object.entries(conditions).map(([value, label]) => <label key={value} className={styles.choice}>
        <input type="radio" name="condition" value={value} checked={details.condition === value} required onChange={e => onChange("condition", e.target.value)} />{label}
      </label>)}
    </fieldset>
    <label htmlFor="weightKind">Berat per unit {tag("weightKind")}</label>
    <select id="weightKind" value={details.weightKind} onChange={e => onChange("weightKind", e.target.value)}>
      <option value="unknown">Belum tahu</option><option value="actual">Hasil timbangan</option><option value="estimate">Perkiraan rentang</option>
    </select>
    {details.weightKind === "actual" && <>
      <label htmlFor="weightKg">Berat (kg)</label>
      <input id="weightKg" type="number" min="0.001" max="1000" step="any" value={details.weightKg} required onChange={e => onChange("weightKg", e.target.value)} />
    </>}
    {details.weightKind === "estimate" && <div className={styles.weightRange}>
      <label>Minimum (kg)<input aria-label="Perkiraan berat minimum kg" type="number" min="0.001" max="1000" step="any" value={details.weightMinKg} required onChange={e => onChange("weightMinKg", e.target.value)} /></label>
      <label>Maksimum (kg)<input aria-label="Perkiraan berat maksimum kg" type="number" min="0.001" max="1000" step="any" value={details.weightMaxKg} required onChange={e => onChange("weightMaxKg", e.target.value)} /></label>
    </div>}
    <label htmlFor="notes">Catatan fisik (opsional) {tag("notes")}</label>
    <textarea id="notes" rows={3} maxLength={2000} value={details.notes} placeholder="Contoh: layar retak, kabel tidak disertakan" onChange={e => onChange("notes", e.target.value)} />
  </div>;
}
