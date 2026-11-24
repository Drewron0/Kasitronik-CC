import { conditions } from "@/app/reports/item-details";
import { formatKm } from "@/lib/notifications/format";
import type { JobSummary } from "@/lib/collector/interfaces/job-view.type";

export function jobTitle(job: Pick<JobSummary, "quantity" | "itemName">): string {
  return `${job.quantity}x ${job.itemName}`;
}

/** Short facts for a job card, in reading order. Never includes the address. */
export function jobFacts(job: JobSummary): string[] {
  const condition = conditions[job.condition as keyof typeof conditions] ?? job.condition;
  return [job.district, job.distanceKm === null ? "" : formatKm(job.distanceKm), condition, job.weightLabel].filter(Boolean);
}

export function mapsLink(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}
