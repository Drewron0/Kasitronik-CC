"use client";

import { useState } from "react";
import type { CopyLinkProps } from "../interfaces/copy-link-props.interface";
import styles from "../admin.module.css";

/** Shows a personal link once so the team can send it to the collector by WhatsApp. */
export default function CopyLinkButton({ link }: CopyLinkProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={styles.linkBox}>
      <code className={styles.linkText}>{link}</code>
      <button type="button" className={styles.secondaryButton} onClick={copy}>
        {copied ? "Tersalin" : "Salin link"}
      </button>
    </div>
  );
}
