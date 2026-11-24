"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { completeHandover } from "../actions/complete.action";
import { wibTime } from "../action-messages";
import type { HandoverFormProps } from "../interfaces/handover-form-props.interface";
import styles from "../collector.module.css";

export default function HandoverForm({ jobRef, lockedUntil }: HandoverFormProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [price, setPrice] = useState("");
  const [codeError, setCodeError] = useState(lockedUntil ? `Terlalu banyak kode salah. Coba lagi pukul ${wibTime(lockedUntil)} WIB.` : "");
  const [priceError, setPriceError] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCodeError("");
    setPriceError("");
    setError("");
    if (!/^[0-9]{4}$/.test(code.trim())) {
      setCodeError("Isi 4 angka kode dari pemilik.");
      return;
    }
    startTransition(async () => {
      const result = await completeHandover(jobRef, code, price);
      if (result.ok) {
        router.refresh();
        return;
      }
      if (result.field === "code") setCodeError(result.error);
      else if (result.field === "price") setPriceError(result.error);
      else setError(result.error);
    });
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.field}>
        <label htmlFor="handoverCode">Kode dari pemilik</label>
        <input
          id="handoverCode"
          className={styles.codeInput}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={4}
          placeholder="0000"
          value={code}
          disabled={pending || Boolean(lockedUntil)}
          aria-invalid={Boolean(codeError)}
          aria-describedby={codeError ? "handoverCode-error" : undefined}
          onChange={event => setCode(event.target.value.replace(/[^0-9]/g, ""))}
        />
        {codeError && <p id="handoverCode-error" className={styles.fieldError} role="alert">{codeError}</p>}
      </div>
      <div className={styles.field}>
        <label htmlFor="agreedPrice">Harga disepakati (kosongkan jika gratis)</label>
        <input
          id="agreedPrice"
          inputMode="numeric"
          placeholder="Rp 0"
          value={price}
          disabled={pending}
          aria-invalid={Boolean(priceError)}
          aria-describedby={priceError ? "agreedPrice-error" : undefined}
          onChange={event => setPrice(event.target.value)}
        />
        {priceError && <p id="agreedPrice-error" className={styles.fieldError} role="alert">{priceError}</p>}
      </div>
      <button type="submit" className={styles.primaryButton} disabled={pending || Boolean(lockedUntil)}>
        {pending ? "Menyimpan..." : "Selesai dijemput"}
      </button>
      {error && <p className={styles.error} role="alert">{error}</p>}
    </form>
  );
}
