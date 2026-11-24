"use client";

import { useState, type FormEvent } from "react";
import AreaListField from "@/app/location/components/AreaListField";
import type { CollectorArea } from "@/lib/collector/interfaces/collector-area.interface";
import { adminRequest } from "../actions/admin-request";
import type { CollectorFormProps } from "../interfaces/collector-form-props.interface";
import styles from "../admin.module.css";

export default function CollectorForm({ onCreated }: CollectorFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notifyMode, setNotifyMode] = useState<"instant" | "digest">("instant");
  const [areas, setAreas] = useState<CollectorArea[]>([]);
  const [errors, setErrors] = useState<Partial<Record<"name" | "phone" | "areas" | "form", string>>>({});
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setBusy(true);
    const result = await adminRequest<{ id: string; link: string }>("/api/admin/collectors", "POST", { name, phone, notifyMode, areas });
    setBusy(false);
    if (!result.ok) {
      setErrors({ [result.field ?? "form"]: result.error });
      return;
    }
    setName("");
    setPhone("");
    setAreas([]);
    onCreated(result.data.link);
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.field}>
        <label htmlFor="collector-name">Nama</label>
        <input id="collector-name" value={name} maxLength={100} disabled={busy} aria-invalid={Boolean(errors.name)} onChange={e => setName(e.target.value)} />
        {errors.name && <p className={styles.fieldError} role="alert">{errors.name}</p>}
      </div>
      <div className={styles.field}>
        <label htmlFor="collector-phone">Nomor WhatsApp</label>
        <input id="collector-phone" type="tel" inputMode="tel" placeholder="0812 3456 7890" value={phone} disabled={busy} aria-invalid={Boolean(errors.phone)} onChange={e => setPhone(e.target.value)} />
        {errors.phone && <p className={styles.fieldError} role="alert">{errors.phone}</p>}
      </div>
      <div className={styles.field}>
        <label htmlFor="collector-mode">Notifikasi</label>
        <select id="collector-mode" value={notifyMode} disabled={busy} onChange={e => setNotifyMode(e.target.value === "digest" ? "digest" : "instant")}>
          <option value="instant">Langsung</option>
          <option value="digest">Rangkuman 2x sehari</option>
        </select>
      </div>
      <div className={styles.field}>
        <span className={styles.label}>Wilayah jemput</span>
        <AreaListField value={areas} disabled={busy} onChange={setAreas} />
        {errors.areas && <p className={styles.fieldError} role="alert">{errors.areas}</p>}
      </div>
      <button type="submit" className={styles.primaryButton} disabled={busy}>{busy ? "Menyimpan..." : "Tambah pengepul"}</button>
      {errors.form && <p className={styles.fieldError} role="alert">{errors.form}</p>}
    </form>
  );
}
