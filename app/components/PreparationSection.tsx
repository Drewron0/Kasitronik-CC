"use client";

import { useState } from "react";
import ChevronDownIcon from "./icons/ChevronDownIcon";
import styles from "../page.module.css";

interface GuidelineItem {
  id: string;
  title: string;
  description: string;
}

const GUIDELINES: GuidelineItem[] = [
  {
    id: "foto",
    title: "Foto kondisi perangkat",
    description:
      "Ambil foto menyeluruh dan bagian yang rusak. Jangan sertakan dokumen berinformasi pribadi dalam foto.",
  },
  {
    id: "jumlah",
    title: "Catat jumlah dan tipe",
    description:
      "Sertakan perkiraan jumlah unit dan kondisi fungsional (masih menyala atau mati total).",
  },
  {
    id: "lokasi",
    title: "Tentukan titik temu",
    description:
      "Sediakan alamat penjemputan yang akurat dan patokan lokasi yang mudah diakses kurir.",
  },
  {
    id: "keamanan",
    title: "Amankan data pribadi",
    description:
      "Lakukan reset pabrik dan lepaskan media penyimpanan eksternal serta kartu SIM sebelum diserahkan.",
  },
];

export default function PreparationSection() {
  // First item open by default
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    foto: true,
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section
      id="persiapan"
      className={styles.preparation}
      aria-labelledby="preparation-title"
    >
      <div>
        <p className={styles.eyebrow}>PANDUAN</p>
        <h2 id="preparation-title">
          Persiapan sebelum
          <br />
          penjemputan
        </h2>
        <p className={styles.preparationIntro}>
          Ikuti langkah sederhana ini untuk memudahkan proses penyerahan barang.
        </p>
      </div>

      <div className={styles.details} role="region" aria-label="Daftar panduan persiapan">
        {GUIDELINES.map((item) => {
          const isOpen = Boolean(openItems[item.id]);
          const contentId = `guideline-content-${item.id}`;
          const triggerId = `guideline-trigger-${item.id}`;

          return (
            <div key={item.id} className={styles.accordionItem}>
              <button
                type="button"
                id={triggerId}
                className={styles.accordionTrigger}
                onClick={() => toggleItem(item.id)}
                aria-expanded={isOpen}
                aria-controls={contentId}
              >
                <span>{item.title}</span>
                <ChevronDownIcon
                  size={20}
                  className={`${styles.accordionIcon} ${
                    isOpen ? styles.accordionIconOpen : ""
                  }`}
                />
              </button>

              <div
                id={contentId}
                role="region"
                aria-labelledby={triggerId}
                className={`${styles.accordionContent} ${
                  isOpen ? styles.accordionContentOpen : ""
                }`}
              >
                <div className={styles.accordionInner}>
                  <p>{item.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
