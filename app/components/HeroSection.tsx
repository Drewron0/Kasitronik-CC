import Image from "next/image";
import type { GalleryItem } from "../interfaces/gallery-item.interface";
import styles from "../page.module.css";

const HERO_IMAGES: GalleryItem[] = [
  {
    id: "1",
    src: "/images/assets/ewaste-sorting.webp",
    alt: "Fasilitas pemilahan sampah elektronik",
    label: "Pemilahan E-Waste",
  },
  {
    id: "2",
    src: "/images/assets/ewaste-circuit.webp",
    alt: "Pemisahan papan sirkuit elektronik",
    label: "Daur Ulang Sirkuit",
  },
  {
    id: "3",
    src: "/images/assets/ewaste-collection.webp",
    alt: "Pengumpulan unit elektronik bekas",
    label: "Unit Terkumpul",
  },
  {
    id: "4",
    src: "/images/assets/ewaste-hardware.webp",
    alt: "Perangkat keras untuk ekstraksi material",
    label: "Ekstraksi Material",
  },
  {
    id: "5",
    src: "/images/assets/ewaste-phones.webp",
    alt: "Koleksi ponsel dan perangkat pintar lama",
    label: "Ponsel & Periferal",
  },
];

export default function HeroSection() {
  // 3 repetitions guarantee zero empty gaps on any screen resolution
  const seamlessImages = [...HERO_IMAGES, ...HERO_IMAGES, ...HERO_IMAGES];

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      {/* Full-bleed massive scrolling gallery */}
      <div className={styles.heroBackdrop} aria-hidden="true">
        <div className={styles.heroBackdropTrack}>
          {seamlessImages.map((item, index) => (
            <div key={`${item.id}-${index}`} className={styles.heroBackdropCard}>
              <Image
                src={item.src}
                alt=""
                width={760}
                height={520}
                className={styles.heroBackdropImage}
                priority={index < 4}
                sizes="(max-width: 640px) 340px, (max-width: 1024px) 560px, 760px"
              />
            </div>
          ))}
        </div>
        <div className={styles.heroBackdropOverlay} />
      </div>

      {/* Floating text content directly on the ambient backdrop - no glass box */}
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>PENGELOLAAN ELEKTRONIK</p>

        <h1 id="hero-title">
          Elektronik kurang lama.
          <br />
          <span>Langkah baru.</span>
        </h1>

        <p className={styles.intro}>
          Hubungkan barang elektronik yang tak terpakai dengan pengepul terpercaya.
          Mulai dari mengenali barang, lalu siapkan laporan pengambilan.
        </p>

        <div className={styles.actions}>
          <a className={styles.primaryButton} href="#kategori">
            Siapkan laporan
          </a>
          <a className={styles.secondaryButton} href="#alur">
            Lihat cara kerja
          </a>
        </div>
      </div>
    </section>
  );
}
