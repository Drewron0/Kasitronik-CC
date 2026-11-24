import Image from "next/image";
import Link from "next/link";
import { formatRupiah, waLink } from "@/lib/notifications/format";
import type { JobDetailProps } from "../interfaces/job-detail-props.interface";
import { jobFacts, jobTitle, mapsLink } from "../labels";
import ClaimButton from "./ClaimButton";
import HandoverForm from "./HandoverForm";
import ReleaseButton from "./ReleaseButton";
import JobMap from "./JobMap";
import JobClosed from "./JobClosed";
import styles from "../collector.module.css";

export default function JobDetail({ view, jobRef, photoUrl, afterClaimHref }: JobDetailProps) {
  if (view.state === "taken") return <JobClosed message="Laporan ini sudah diambil pengepul lain." />;
  if (view.state === "closed") return <JobClosed message="Laporan ini sudah ditutup." />;

  const photo = photoUrl
    ? <Image src={photoUrl} alt={view.itemName} width={640} height={480} className={styles.photo} unoptimized />
    : null;
  const facts = (
    <ul className={styles.facts}>
      {jobFacts(view).map(fact => <li key={fact} className={styles.fact}>{fact}</li>)}
    </ul>
  );

  if (view.state === "open") {
    return (
      <section className={styles.card}>
        {photo}
        <h1 className={styles.jobTitle}>{jobTitle(view)}</h1>
        {facts}
        <ClaimButton jobRef={jobRef} afterClaimHref={afterClaimHref} />
      </section>
    );
  }

  if (view.state === "done") {
    return (
      <section className={styles.card}>
        <p className={styles.status} role="status">Selesai dijemput</p>
        <h1 className={styles.jobTitle}>{jobTitle(view)}</h1>
        <p className={styles.muted}>{view.agreedPriceIdr === null ? "Diberikan gratis." : `Harga disepakati ${formatRupiah(view.agreedPriceIdr)}.`}</p>
        <div className={styles.actions}>
          <Link href="/p" className={styles.secondaryButton}>Lihat laporan lain</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className={styles.card}>
        <h1 className={styles.jobTitle}>{jobTitle(view)}</h1>
        <p className={styles.address}>{view.address}</p>
        {view.instructions && <p className={styles.muted}>{view.instructions}</p>}
        <JobMap latitude={view.latitude} longitude={view.longitude} />
        <div className={styles.actions}>
          {view.ownerPhone && <a href={waLink(view.ownerPhone)} className={styles.secondaryButton} target="_blank" rel="noopener noreferrer">Chat pemilik</a>}
          <a href={mapsLink(view.latitude, view.longitude)} className={styles.secondaryButton} target="_blank" rel="noopener noreferrer">Buka rute</a>
        </div>
      </section>
      <section className={styles.card} aria-label="Serah terima">
        <HandoverForm jobRef={jobRef} lockedUntil={view.lockedUntil} />
      </section>
      <ReleaseButton jobRef={jobRef} />
    </>
  );
}
