import styles from "./page.module.css";
import AccountNav from "./components/AccountNav";

export default function Home() {
  return (
    <div className={styles.home} id="top">
      <a href="#main" className={styles.skipLink}>
        Lewati navigasi
      </a>

      <header className={styles.header}>
        <a href="#top" className={styles.brand} aria-label="E-Waste beranda">
          <span className={styles.brandMark} aria-hidden="true">
            e
          </span>
          E-Waste
        </a>

        <nav className={styles.nav} aria-label="Navigasi utama">
          <a href="#alur">Cara kerja</a>
          <a href="#persiapan">Panduan barang</a>
          <AccountNav />
        </nav>
      </header>

      <main id="main">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>DARI RUMAH, UNTUK LINGKUNGAN</p>

            <h1 id="hero-title">
              Elektronik lama.
              <br />
              <span>Langkah baru.</span>
            </h1>

            <p className={styles.intro}>
              Hubungkan barang elektronik yang tak terpakai dengan pengepul.
              Mulai dari mengenali barang, lalu siapkan laporan pengambilan.
            </p>

            <div className={styles.actions}>
              <a className={styles.primaryButton} href="#persiapan">
                Siapkan laporan
              </a>
              <a className={styles.secondaryButton} href="#alur">
                Lihat cara kerja
              </a>
            </div>

            <p className={styles.note}>
              HP lama, laptop rusak, hingga kabel yang menumpuk.
            </p>
          </div>

          <aside className={styles.guide} aria-labelledby="guide-title">
            <div className={styles.guideHeader}>
              <span className={styles.eyebrow}>MULAI DARI SATU BARANG</span>
              <span className={styles.smallLabel}>Panduan persiapan</span>
            </div>

            <h2 id="guide-title">Sudah lama tidak dipakai?</h2>
            <p>
              Pisahkan perangkat yang ingin kamu laporkan. Catat kondisinya
              dengan jujur, termasuk kerusakan yang terlihat.
            </p>

            <ul className={styles.itemList}>
              <li>
                <span className={styles.itemNumber}>01</span>
                <div>
                  <strong>HP & tablet</strong>
                  <span>Perangkat lama atau layar rusak</span>
                </div>
              </li>
              <li>
                <span className={styles.itemNumber}>02</span>
                <div>
                  <strong>Laptop & komputer</strong>
                  <span>Perangkat yang sudah tidak digunakan</span>
                </div>
              </li>
              <li>
                <span className={styles.itemNumber}>03</span>
                <div>
                  <strong>Kabel & aksesori</strong>
                  <span>Charger, kabel, dan aksesori elektronik</span>
                </div>
              </li>
            </ul>

            <div className={styles.guideFooter}>
              <span className={styles.dot} aria-hidden="true" />
              Kondisi barang dicantumkan dalam laporan.
            </div>
          </aside>
        </section>

        <section
          id="alur"
          className={styles.workflow}
          aria-labelledby="workflow-title"
        >
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>ALUR PENGAMBILAN</p>
            <h2 id="workflow-title">Dari laporan sampai selesai.</h2>
            <p>
              Berikut alur layanan yang sedang kami siapkan.
            </p>
          </div>

          <ol className={styles.steps}>
            <li>
              <span className={styles.stepNumber}>01</span>
              <h3>Laporkan barang</h3>
              <p>Isi detail, unggah foto, dan tentukan lokasi pengambilan.</p>
            </li>
            <li>
              <span className={styles.stepNumber}>02</span>
              <h3>Tunggu pemeriksaan</h3>
              <p>Laporan diperiksa sebelum dibagikan kepada pengepul.</p>
            </li>
            <li>
              <span className={styles.stepNumber}>03</span>
              <h3>Atur pengambilan</h3>
              <p>Pengepul mengklaim barang dan mengoordinasikan pengambilan.</p>
            </li>
            <li>
              <span className={styles.stepNumber}>04</span>
              <h3>Konfirmasi selesai</h3>
              <p>Konfirmasikan setelah barang benar-benar diambil.</p>
            </li>
          </ol>
        </section>

        <section
          id="persiapan"
          className={styles.preparation}
          aria-labelledby="preparation-title"
        >
          <div>
            <p className={styles.eyebrow}>SEBELUM MELAPOR</p>
            <h2 id="preparation-title">
              Sedikit persiapan,
              <br />
              laporan lebih jelas.
            </h2>
            <p className={styles.preparationIntro}>
              Siapkan informasi ini agar kondisi barang mudah dipahami.
            </p>

            <div className={styles.notice}>
              <strong>Formulir segera tersedia</strong>
              <p>
                Website masih dalam pengembangan. Pengiriman laporan dan
                pengambilan belum tersedia melalui halaman ini.
              </p>
            </div>
          </div>

          <div className={styles.details}>
            <details open>
              <summary>Foto barang dengan jelas</summary>
              <p>
                Ambil foto keseluruhan barang dan bagian yang rusak.
                Hindari menyertakan dokumen pribadi dalam foto.
              </p>
            </details>

            <details>
              <summary>Catat kondisi dan jumlah</summary>
              <p>
                Tulis jenis perangkat, jumlah unit, serta apakah barang
                masih menyala atau memiliki kerusakan tertentu.
              </p>
            </details>

            <details>
              <summary>Siapkan lokasi pengambilan</summary>
              <p>
                Siapkan alamat dan petunjuk lokasi untuk koordinasi.
                Jangan membagikan alamat lengkap di ruang publik.
              </p>
            </details>

            <details>
              <summary>Periksa data pribadi</summary>
              <p>
                Cadangkan dan hapus data pribadi sebelum menyerahkan
                perangkat. Lepaskan kartu SIM dan kartu memori jika ada.
              </p>
            </details>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <a href="#top" className={styles.brand}>
          E-Waste
        </a>
        <p>Proyek Cloud Computing · Kelompok 1</p>
        <a href="#top" className={styles.backLink}>
          Kembali ke atas
        </a>
      </footer>
    </div>
  );
}