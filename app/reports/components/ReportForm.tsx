"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { ReportRequestError, requestSuggestions, submitReport } from "../actions/submit-report.action";
import { emptyDetails, MAX_IMAGE_BYTES, mergeSuggestion, parseSubmission } from "../item-details";
import type { ItemDetails } from "../interfaces/item-details.interface";
import ItemFields from "./ItemFields";
import OwnerPhoneField from "./OwnerPhoneField";
import { getLastOwnerPhone } from "../actions/get-last-owner-phone.action";
import { OWNER_PHONE_ERROR, parseOwnerPhone } from "../owner-phone";
import LocationFields from "@/app/location/components/LocationFields";
import { emptyLocation, parsePickupLocation } from "@/app/location/location";
import type { PickupLocation } from "@/app/location/interfaces/pickup-location.interface";
import styles from "../reports.module.css";

export default function ReportForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const photoSeqRef = useRef(0);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [details, setDetails] = useState<ItemDetails>({ ...emptyDetails });
  const [location, setLocation] = useState<PickupLocation>({ ...emptyLocation });
  const [mode, setMode] = useState("ai");
  const [consent, setConsent] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [suggested, setSuggested] = useState<string[]>([]);
  const [loading, setLoading] = useState<"suggest" | "submit" | null>(null);
  const [pending, setPending] = useState<FormData | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [savedId, setSavedId] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/login?redirectTo=/reports/new");
      } else {
        setSignedIn(true);
        getLastOwnerPhone().then(phone => setOwnerPhone(current => current || phone));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
      if (!session) {
        router.replace("/login?redirectTo=/reports/new");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (preview) return () => URL.revokeObjectURL(preview);
  }, [preview]);

  function showError(message: string) {
    setError(message);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function change(key: keyof ItemDetails, value: string) {
    setDetails(current => ({ ...current, [key]: value }));
    setSuggested(current => current.filter(field => field !== key && !(key.startsWith("weight") && field === "weightKind")));
    setConfirmed(false);
    setStatus("");
  }

  function clearDetails() {
    setDetails({ ...emptyDetails });
    setSuggested([]);
    setConfirmed(false);
    setStatus("Detail barang dikosongkan.");
  }

  async function runDetect(targetPhoto: File, seq: number) {
    if (!consent || !signedIn) return;
    const form = new FormData();
    form.set("photo", targetPhoto);
    form.set("consent", "yes");
    setLoading("suggest");
    setError("");
    setStatus("AI sedang membaca foto...");
    try {
      const result = await requestSuggestions(form);
      if (seq !== photoSeqRef.current) return;
      setDetails(current => {
        const next = mergeSuggestion(current, result);
        const changed = (Object.keys(next) as (keyof ItemDetails)[]).filter(key => next[key] !== current[key]);
        setSuggested(prev => [...new Set([...prev, ...changed])]);
        setStatus(
          changed.length
            ? "Detail barang diisi otomatis dari foto. Anda dapat mengubah atau menghapusnya."
            : "Detail tambahan belum terbaca. Anda bisa mengisi formulir secara manual."
        );
        return next;
      });
      setConfirmed(false);
    } catch (cause) {
      if (seq !== photoSeqRef.current) return;
      showError(cause instanceof Error && cause.name === "Error" ? cause.message : "AI tidak dapat dihubungi. Anda tetap bisa mengisi manual.");
      setStatus("");
    } finally {
      if (seq === photoSeqRef.current) setLoading(null);
    }
  }

  function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    const seq = ++photoSeqRef.current;
    setPhoto(null);
    setPreview("");
    setError("");
    setStatus("");
    setConfirmed(false);
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type) || !file.size || file.size > MAX_IMAGE_BYTES) {
      showError("Pilih foto JPEG atau PNG, maksimal 5 MB.");
      event.target.value = "";
      return;
    }
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
    if (mode === "ai" && consent && signedIn) {
      void runDetect(file, seq);
    }
  }

  async function suggest() {
    if (!photo || !consent || !signedIn || loading) return;
    await runDetect(photo, ++photoSeqRef.current);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError("");
    setStatus("");
    setPhoneError("");
    if (!signedIn || !photo) {
      showError("Masuk dan pilih foto sebelum submit barang.");
      return;
    }
    let form = pending;
    if (!form) {
      form = new FormData();
      form.set("photo", photo);
      form.set("submissionId", crypto.randomUUID());
      for (const [key, value] of Object.entries(details)) form.set(key, value);
      form.set("confirmed", confirmed ? "yes" : "no");
      form.set("pickupLatitude", location.coordinates ? String(location.coordinates.latitude) : "");
      form.set("pickupLongitude", location.coordinates ? String(location.coordinates.longitude) : "");
      form.set("pickupAddress", location.address);
      form.set("pickupInstructions", location.instructions);
      form.set("locationConfirmed", location.confirmed ? "yes" : "no");
      form.set("ownerPhone", ownerPhone);
      try {
        parseSubmission(form);
        parsePickupLocation(form);
        parseOwnerPhone(form);
      } catch (cause) {
        const message = (cause as Error).message;
        if (message === OWNER_PHONE_ERROR) setPhoneError(message);
        else showError(message);
        return;
      }
    }
    setPending(form);
    setLoading("submit");
    try {
      setSavedId(await submitReport(form));
      setPending(null);
    } catch (cause) {
      if (cause instanceof ReportRequestError && cause.status < 500) setPending(null);
      showError(cause instanceof ReportRequestError ? cause.message : "Status kiriman belum dapat dipastikan. Coba kirim kembali dengan data yang sama.");
    } finally {
      setLoading(null);
    }
  }

  if (savedId) {
    return (
      <section className={styles.result} role="status">
        <span className={styles.badge}>Menunggu peninjauan</span>
        <h2>Barang berhasil dikirim</h2>
        <p>Nomor kiriman: <code>{savedId}</code></p>
        <div className={styles.authLinks}>
          <Link href="/" className={styles.button}>Kembali ke beranda</Link>
          <button className={styles.secondaryButton} onClick={() => window.location.reload()}>Submit barang lain</button>
        </div>
      </section>
    );
  }

  return (
    <form ref={formRef} className={styles.form} onSubmit={submit} aria-busy={Boolean(loading)}>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <fieldset disabled={Boolean(loading || pending)} className={styles.fields}>
        <div className={styles.uploadPanel}>
          <label htmlFor="photo">Foto barang</label>
          <div className={styles.preview}>
            {preview ? (
              <Image src={preview} alt="Pratinjau barang" fill unoptimized sizes="(max-width: 720px) 100vw, 480px" />
            ) : (
              <span>Pratinjau foto</span>
            )}
          </div>
          <input
            id="photo"
            type="file"
            accept="image/jpeg,image/png"
            onChange={selectPhoto}
            aria-describedby="photo-hint"
            required
          />
          <p id="photo-hint" className={styles.hint}>
            Satu jenis barang. JPEG/PNG, maksimal 5 MB dan 20 megapiksel.
          </p>
          <div className={styles.modeSwitch} role="group" aria-label="Cara mengisi detail">
            <button type="button" aria-pressed={mode === "ai"} onClick={() => setMode("ai")}>
              Deteksi otomatis AI
            </button>
            <button type="button" aria-pressed={mode === "manual"} onClick={() => setMode("manual")}>
              Isi manual
            </button>
          </div>
          {mode === "ai" && (
            <>
              <label className={styles.consent}>
                <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
                <span>Saya setuju foto dikirim ke Google Gemini untuk mengisi detail otomatis.</span>
              </label>
              <div className={styles.authLinks}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={suggest}
                  disabled={!photo || !consent || !signedIn}
                >
                  {loading === "suggest" ? "Membaca foto..." : "Deteksi ulang foto"}
                </button>
                {suggested.length > 0 && (
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={clearDetails}
                  >
                    Hapus isian
                  </button>
                )}
              </div>
            </>
          )}
        </div>
        <ItemFields details={details} suggested={suggested} onChange={change} />
      </fieldset>
      <LocationFields
        value={location}
        onChange={next => {
          setLocation(next);
          setConfirmed(false);
        }}
        disabled={Boolean(loading || pending)}
        signedIn={signedIn === true}
      />
      <div className={styles.submitArea}>
        <OwnerPhoneField
          value={ownerPhone}
          error={phoneError}
          disabled={Boolean(loading || pending)}
          onChange={value => {
            setOwnerPhone(value);
            setPhoneError("");
          }}
        />
        <label className={styles.consent}>
          <input
            type="checkbox"
            checked={confirmed}
            onChange={e => setConfirmed(e.target.checked)}
            disabled={Boolean(loading || pending)}
            required
          />
          <span>Saya sudah memeriksa detail dan kondisi barang yang akan dikirim.</span>
        </label>
        {signedIn === false ? (
          <div className={styles.authLinks}>
            <Link href="/login?redirectTo=/reports/new" className={styles.button}>
              Masuk untuk submit
            </Link>
            <Link href="/register">Daftar akun</Link>
          </div>
        ) : (
          <button
            className={styles.button}
            type="submit"
            disabled={Boolean(loading) || signedIn === null}
          >
            {signedIn === null
              ? "Memuat akun..."
              : loading === "submit"
              ? "Menyimpan barang..."
              : pending
              ? "Coba kirim kembali"
              : "Submit barang"}
          </button>
        )}
      </div>
      {pending && !loading && (
        <p className={styles.status}>
          Data dikunci sementara agar percobaan ulang memakai kiriman yang sama.
        </p>
      )}
      <p className={styles.status} role="status">
        {loading === "suggest"
          ? "AI sedang membaca foto."
          : loading === "submit"
          ? "Foto dan detail sedang disimpan."
          : status}
      </p>
    </form>
  );
}
