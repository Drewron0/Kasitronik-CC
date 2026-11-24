import type { Collector } from "@/lib/collector/interfaces/collector.interface";
import type { HomeJob } from "./home-job.interface";

export interface CollectorHomeProps {
  collector: Collector;
  held: HomeJob[];
  open: HomeJob[];
  pushDevices: number;
  vapidPublicKey: string;
}
