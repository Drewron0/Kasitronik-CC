"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { SubmissionItem } from "../interfaces/submission-item.interface";
import {
  formatCategory,
  formatCondition,
  formatDate,
  formatWeight,
} from "../utils/formatters";
import styles from "../dashboard.module.css";

interface ReceiptModalProps {
  item: SubmissionItem | null;
  onClose: () => void;
}

export default function ReceiptModal({ item, onClose }: ReceiptModalProps) {
  useEffect(() => {
    if (!item) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  const receiptNumber = `KST-${item.id.replace(/-/g, "").slice(0, 10).toUpperCase()}`;

  const handlePrint = () => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    iframe.setAttribute("aria-hidden", "true");
    document.body.appendChild(iframe);

    const pri = iframe.contentWindow;
    if (!pri) {
      window.print();
      return;
    }

    pri.document.open();
    pri.document.write(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="utf-8" />
          <title>Bukti Serah Terima - ${receiptNumber}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm 20mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              color: #1c2621;
              background: #ffffff;
              padding: 24px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding-bottom: 16px;
              border-bottom: 2px solid #046645;
              margin-bottom: 20px;
            }
            .brand {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .brand img {
              width: 40px;
              height: 40px;
            }
            .brand-name {
              font-size: 20px;
              font-weight: 700;
              color: #1c2621;
              line-height: 1.2;
            }
            .brand-desc {
              font-size: 12px;
              color: #59665d;
            }
            .meta {
              text-align: right;
            }
            .meta-num {
              font-family: monospace;
              font-size: 14px;
              font-weight: 700;
              color: #046645;
              letter-spacing: 0.05em;
            }
            .meta-date {
              font-size: 12px;
              color: #59665d;
              margin-top: 3px;
            }
            .title-box {
              text-align: center;
              margin: 20px 0 24px;
            }
            .title-box h1 {
              font-size: 18px;
              font-weight: 700;
              color: #1c2621;
              margin-bottom: 6px;
            }
            .title-box p {
              font-size: 13px;
              color: #59665d;
            }
            .table {
              width: 100%;
              border: 1px solid #e1e7de;
              border-radius: 10px;
              border-collapse: separate;
              border-spacing: 0;
              overflow: hidden;
              margin-bottom: 24px;
              background: #faf9f7;
            }
            .table tr {
              border-bottom: 1px solid #e1e7de;
            }
            .table tr:last-child {
              border-bottom: none;
            }
            .table td {
              padding: 12px 16px;
              font-size: 13px;
              border-bottom: 1px solid #e1e7de;
            }
            .table tr:last-child td {
              border-bottom: none;
            }
            .col-label {
              color: #59665d;
              font-weight: 500;
              width: 40%;
            }
            .col-value {
              color: #1c2621;
              font-weight: 600;
              text-align: right;
            }
            .status-verified {
              color: #046645;
              font-weight: 700;
            }
            .seal-box {
              display: flex;
              align-items: center;
              gap: 12px;
              padding-top: 16px;
              border-top: 1px solid #e1e7de;
              font-size: 12px;
              color: #59665d;
              line-height: 1.5;
            }
            .seal-box svg {
              flex-shrink: 0;
            }
            .seal-box strong {
              display: block;
              font-size: 13px;
              color: #046645;
              margin-bottom: 2px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="brand">
                <img src="/logo.svg" alt="Kasitronik Logo" />
                <div>
                  <div class="brand-name">Kasitronik</div>
                  <div class="brand-desc">Platform Daur Ulang E-Waste Terpadu</div>
                </div>
              </div>
              <div class="meta">
                <div class="meta-num">${receiptNumber}</div>
                <div class="meta-date">${formatDate(item.created_at)}</div>
              </div>
            </div>

            <div class="title-box">
              <h1>Tanda Terima Penjemputan Elektronik Bekas</h1>
              <p>Bukti sah serah terima barang elektronik untuk pemrosesan daur ulang ramah lingkungan.</p>
            </div>

            <table class="table">
              <tr>
                <td class="col-label">Nama Barang</td>
                <td class="col-value">${item.item_name}</td>
              </tr>
              <tr>
                <td class="col-label">Kategori</td>
                <td class="col-value">${formatCategory(item.category)}</td>
              </tr>
              <tr>
                <td class="col-label">Kondisi</td>
                <td class="col-value">${formatCondition(item.condition)}</td>
              </tr>
              <tr>
                <td class="col-label">Jumlah & Berat</td>
                <td class="col-value">${item.quantity} Unit • ${formatWeight(item)}</td>
              </tr>
              ${
                item.brand_model
                  ? `
                <tr>
                  <td class="col-label">Merek / Tipe</td>
                  <td class="col-value">${item.brand_model}</td>
                </tr>
              `
                  : ""
              }
              ${
                item.pickup_address
                  ? `
                <tr>
                  <td class="col-label">Lokasi Penjemputan</td>
                  <td class="col-value">${item.pickup_address}</td>
                </tr>
              `
                  : ""
              }
              <tr>
                <td class="col-label">Status Verifikasi</td>
                <td class="col-value status-verified">Selesai & Terverifikasi</td>
              </tr>
            </table>

            <div class="seal-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#046645" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <div>
                <strong>Diverifikasi oleh Sistem Kasitronik</strong>
                <span>Barang ini telah diserahterimakan dan dicatat dalam rantai penanganan limbah elektronik berkelanjutan.</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    pri.document.close();

    setTimeout(() => {
      pri.focus();
      pri.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }, 250);
  };

  return (
    <div
      className={`${styles.modalBackdrop} ${styles.receiptBackdrop}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-modal-title"
    >
      <div className={`${styles.modal} ${styles.receiptModal}`}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <h2 id="receipt-modal-title" className={styles.modalTitle}>
            Bukti Serah Terima
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Tutup bukti serah terima"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className={styles.modalBody}>
          <div className={styles.receiptPaper} id="printable-receipt">
            {/* Receipt Brand Header */}
            <div className={styles.receiptHeader}>
              <div className={styles.receiptBrand}>
                <Image
                  src="/logo.svg"
                  alt="Kasitronik"
                  width={38}
                  height={38}
                  priority
                />
                <div>
                  <span className={styles.receiptBrandTitle}>Kasitronik</span>
                  <span className={styles.receiptBrandSubtitle}>
                    Platform Daur Ulang E-Waste Terpadu
                  </span>
                </div>
              </div>
              <div className={styles.receiptMeta}>
                <span className={styles.receiptNumber}>{receiptNumber}</span>
                <span className={styles.receiptDate}>
                  {formatDate(item.created_at)}
                </span>
              </div>
            </div>

            <div className={styles.receiptDivider} />

            {/* Receipt Title */}
            <div className={styles.receiptDocumentHeading}>
              <h3>Tanda Terima Penjemputan Elektronik Bekas</h3>
              <p>
                Bukti sah serah terima barang elektronik untuk pemrosesan daur ulang ramah lingkungan.
              </p>
            </div>

            {/* Receipt Data Table / Rows */}
            <div className={styles.receiptTable}>
              <div className={styles.receiptRow}>
                <span className={styles.receiptColLabel}>Nama Barang</span>
                <span className={styles.receiptColValue}>{item.item_name}</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptColLabel}>Kategori</span>
                <span className={styles.receiptColValue}>
                  {formatCategory(item.category)}
                </span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptColLabel}>Kondisi</span>
                <span className={styles.receiptColValue}>
                  {formatCondition(item.condition)}
                </span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptColLabel}>Jumlah & Berat</span>
                <span className={styles.receiptColValue}>
                  {item.quantity} Unit • {formatWeight(item)}
                </span>
              </div>
              {item.brand_model ? (
                <div className={styles.receiptRow}>
                  <span className={styles.receiptColLabel}>Merek / Tipe</span>
                  <span className={styles.receiptColValue}>
                    {item.brand_model}
                  </span>
                </div>
              ) : null}
              {item.pickup_address ? (
                <div className={styles.receiptRow}>
                  <span className={styles.receiptColLabel}>
                    Lokasi Penjemputan
                  </span>
                  <span className={styles.receiptColValue}>
                    {item.pickup_address}
                  </span>
                </div>
              ) : null}
              <div className={styles.receiptRow}>
                <span className={styles.receiptColLabel}>Status Verifikasi</span>
                <span
                  className={`${styles.receiptColValue} ${styles.receiptVerifiedText}`}
                >
                  Selesai & Terverifikasi
                </span>
              </div>
            </div>

            {/* Receipt Seal / Footer Note */}
            <div className={styles.receiptSealBox}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <div>
                <strong>Diverifikasi oleh Sistem Kasitronik</strong>
                <span>
                  Barang ini telah diserahterimakan dan dicatat dalam rantai
                  penanganan limbah elektronik berkelanjutan.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.actionButton}
            onClick={handlePrint}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            <span>Cetak / Simpan PDF</span>
          </button>
          <button
            type="button"
            className={styles.actionButton}
            onClick={onClose}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
