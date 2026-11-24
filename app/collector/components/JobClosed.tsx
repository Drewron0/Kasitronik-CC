import Link from "next/link";
import type { JobClosedProps } from "../interfaces/job-closed-props.interface";
import styles from "../collector.module.css";

export default function JobClosed({ message }: JobClosedProps) {
  return (
    <section className={styles.card}>
      <h1 className={styles.jobTitle}>{message}</h1>
      <div className={styles.actions}>
        <Link href="/p" className={styles.secondaryButton}>Lihat laporan lain</Link>
      </div>
    </section>
  );
}
