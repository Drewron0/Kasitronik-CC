"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { ReportRequestError, requestSuggestions, submitReport } from "../actions/submit-report.action";
import { emptyDetails, MAX_IMAGE_BYTES, mergeSuggestion, parseSubmission } from "../item-details";
import type { ItemDetails } from "../interfaces/item-details.interface";
import type { ItemSuggestion } from "../interfaces/item-suggestion.interface";
import ItemFields from "./ItemFields";
import SuggestionPreview from "./SuggestionPreview";
import styles from "../reports.module.css";

export default function ReportForm() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [details, setDetails] = useState<ItemDetails>({ ...emptyDetails });
  const [mode, setMode] = useState("manual");
  const [consent, setConsent] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [suggestion, setSuggestion] = useState<ItemSuggestion | null>(null);
  const [suggested, setSuggested] = useState<string[]>([]);
  const [loading, setLoading] = useState<"suggest" | "submit" | null>(null);
  const [pending, setPending] = useState<FormData | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [savedId, setSavedId] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)));
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => { if (preview) return () => URL.revokeObjectURL(preview); }, [preview]);

  function change(key: keyof ItemDetails, value: string) {
    setDetails(current => ({ ...current, [key]: value }));
    setSuggested(current => current.filter(field => field !== key && !(key.startsWith("weight") && field === "weightKind")));
    setConfirmed(false);
    setStatus("");
  }
  function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPhoto(null); setPreview(""); setSuggestion(null); setError(""); setStatus(""); setConfirmed(false);
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type) || !file.size || file.size > MAX_IMAGE_BYTES) {
      setError("Pilih foto JPEG atau PNG, maksimal 5 MB."); event.target.value = ""; return;
    }
    setPhoto(file); setPreview(URL.createObjectURL(file));
  }
  async function suggest() {
    if (!photo || !consent || !signedIn || loading) return;
    const form = new FormData(); form.set("photo", photo); form.set("consent", "yes");
    setLoading("suggest"); setError(""); setStatus(""); setSuggestion(null);
    try { setSuggestion(await requestSuggestions(form)); setStatus("Saran tersedia. Periksa sebelum mengisi formulir."); }
    catch (cause) { setError(cause instanceof Error && cause.name === "Error" ? cause.message : "AI tidak dapat dihubungi. Anda tetap bisa mengisi manual."); }
    finally { setLoading(null); }
  }
  function applySuggestion() {
    if (!suggestion) return;
    const next = mergeSuggestion(details, suggestion);
    const changed = (Object.keys(next) as (keyof ItemDetails)[]).filter(key => next[key] !== details[key]);
    setDetails(next); setSuggested(current => [...new Set([...current, ...changed])]);
    setSuggestion(null); setConfirmed(false);
    setStatus(changed.length ? "Saran diterapkan. Periksa detail dan pilih kondisi barang." : "Kolom yang sudah terisi tetap dipertahankan.");
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError(""); setStatus("");
    if (!signedIn || !photo) { setError("Masuk dan pilih foto sebelum submit barang."); return; }
    let form = pending;
    if (!form) {
      form = new FormData(); form.set("photo", photo); form.set("submissionId", crypto.randomUUID());
      for (const [key, value] of Object.entries(details)) form.set(key, value);
      form.set("confirmed", confirmed ? "yes" : "no");
      try { parseSubmission(form); } catch (cause) { setError((cause as Error).message); return; }
    }
    setPending(form); setLoading("submit");
    try { setSavedId(await submitReport(form)); setPending(null); }
    catch (cause) {
      if (cause instanceof ReportRequestError && cause.status < 500) setPending(null);
      setError(cause instanceof ReportRequestError ? cause.message : "Status kiriman belum dapat dipastikan. Coba kirim kembali dengan data yang sama.");
    } finally { setLoading(null); }
  }

  if (savedId) return <section className={styles.result} role="status">
    <span className={styles.badge}>Menunggu peninjauan</span><h2>Barang berhasil dikirim</h2>
    <p>Nomor kiriman: <code>{savedId}</code></p>
    <div className={styles.authLinks}><Link href="/" className={styles.button}>Kembali ke beranda</Link><button className={styles.secondaryButton} onClick={() => window.location.reload()}>Submit barang lain</button></div>
  </section>;

  return <form className={styles.form} onSubmit={submit} aria-busy={Boolean(loading)}>
    <fieldset disabled={Boolean(loading || pending)} className={styles.fields}>
      <div className={styles.uploadPanel}>
        <label htmlFor="photo">Foto barang</label>
        <div className={styles.preview}>{preview ? <Image src={preview} alt="Pratinjau barang" fill unoptimized sizes="(max-width: 720px) 100vw, 480px" /> : <span>Pratinjau foto</span>}</div>
        <input id="photo" type="file" accept="image/jpeg,image/png" onChange={selectPhoto} aria-describedby="photo-hint" required />
        <p id="photo-hint" className={styles.hint}>Satu jenis barang. JPEG/PNG, maksimal 5 MB dan 20 megapiksel.</p>
        <div className={styles.modeSwitch} role="group" aria-label="Cara mengisi detail">
          <button type="button" aria-pressed={mode === "manual"} onClick={() => setMode("manual")}>Isi manual</button>
          <button type="button" aria-pressed={mode === "ai"} onClick={() => setMode("ai")}>Bantu isi dengan AI</button>
        </div>
        {mode === "ai" && <>
          <label className={styles.consent}><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /><span>Saya setuju foto dikirim ke Google Gemini untuk saran detail.</span></label>
          <button type="button" className={styles.secondaryButton} onClick={suggest} disabled={!photo || !consent || !signedIn}>{loading === "suggest" ? "Membaca foto..." : "Buat saran dari foto"}</button>
          {suggestion && <SuggestionPreview suggestion={suggestion} onApply={applySuggestion} onDismiss={() => setSuggestion(null)} />}
        </>}
      </div>
      <ItemFields details={details} suggested={suggested} onChange={change} />
    </fieldset>
    <div className={styles.submitArea}>
      <label className={styles.consent}><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} disabled={Boolean(loading || pending)} required /><span>Saya sudah memeriksa detail dan kondisi barang yang akan dikirim.</span></label>
      {signedIn === false ? <div className={styles.authLinks}><Link href="/login" className={styles.button}>Masuk untuk submit</Link><Link href="/register">Daftar akun</Link></div>
        : <button className={styles.button} type="submit" disabled={Boolean(loading) || signedIn === null}>{signedIn === null ? "Memuat akun..." : loading === "submit" ? "Menyimpan barang..." : pending ? "Coba kirim kembali" : "Submit barang"}</button>}
    </div>
    {error && <p className={styles.error} role="alert">{error}</p>}
    {pending && !loading && <p className={styles.status}>Data dikunci sementara agar percobaan ulang memakai kiriman yang sama.</p>}
    <p className={styles.status} role="status">{loading === "suggest" ? "AI sedang membaca foto." : loading === "submit" ? "Foto dan detail sedang disimpan." : status}</p>
  </form>;
}
