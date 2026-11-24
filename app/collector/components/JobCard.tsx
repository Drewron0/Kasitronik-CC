import Link from "next/link";
import Image from "next/image";
import type { JobCardProps } from "../interfaces/job-card-props.interface";
import { jobFacts, jobTitle } from "../labels";
import styles from "../collector.module.css";

export default function JobCard({ job, photoUrl, href }: JobCardProps) {
  return (
    <li>
      <Link href={href} className={styles.jobCard}>
        {photoUrl
          ? <Image src={photoUrl} alt={job.itemName} width={64} height={64} className={styles.thumb} unoptimized />
          : <span className={styles.thumb} aria-hidden="true" />}
        <span className={styles.jobText}>
          <span className={styles.jobTitle}>{jobTitle(job)}</span>
          <span className={styles.muted}>{jobFacts(job).join(" - ")}</span>
        </span>
      </Link>
    </li>
  );
}
