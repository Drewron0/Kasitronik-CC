"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminCollectorRow } from "@/lib/collector/interfaces/admin-collector-row.interface";
import { adminRequest } from "../actions/admin-request";
import type { AttentionData } from "../interfaces/attention-data.interface";
import AttentionList from "./AttentionList";
import CollectorForm from "./CollectorForm";
import CollectorList from "./CollectorList";
import CopyLinkButton from "./CopyLinkButton";
import styles from "../admin.module.css";

export default function AdminView() {
  const [collectors, setCollectors] = useState<AdminCollectorRow[] | null>(null);
  const [attention, setAttention] = useState<AttentionData | null>(null);
  const [denied, setDenied] = useState("");
  const [newLink, setNewLink] = useState("");

  const load = useCallback(async () => {
    const [list, needs] = await Promise.all([
      adminRequest<{ collectors: AdminCollectorRow[] }>("/api/admin/collectors"),
      adminRequest<AttentionData>("/api/admin/attention"),
    ]);
    if (!list.ok) {
      setDenied(list.error);
      return;
    }
    setDenied("");
    setCollectors(list.data.collectors);
    if (needs.ok) setAttention(needs.data);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      if (active) await load();
    })();
    return () => {
      active = false;
    };
  }, [load]);

  if (denied) return <p className={styles.fieldError} role="alert">{denied}</p>;
  if (!collectors) return <p className={styles.muted}>Memuat...</p>;

  return (
    <div className={styles.layout}>
      <section className={styles.card} aria-labelledby="attention-heading">
        <h2 id="attention-heading" className={styles.heading}>Perlu ditangani</h2>
        {attention ? <AttentionList data={attention} onChanged={load} /> : <p className={styles.muted}>Memuat...</p>}
      </section>

      <section className={styles.card} aria-labelledby="collectors-heading">
        <h2 id="collectors-heading" className={styles.heading}>Pengepul</h2>
        <CollectorList collectors={collectors} onChanged={load} />
      </section>

      <section className={styles.card} aria-labelledby="new-collector-heading">
        <h2 id="new-collector-heading" className={styles.heading}>Tambah pengepul</h2>
        {newLink && (
          <div className={styles.section} role="status">
            <p className={styles.success}>Pengepul tersimpan. Kirim link ini lewat WhatsApp pribadi; link hanya tampil sekali.</p>
            <CopyLinkButton link={newLink} />
          </div>
        )}
        <CollectorForm onCreated={link => { setNewLink(link); load(); }} />
      </section>
    </div>
  );
}
