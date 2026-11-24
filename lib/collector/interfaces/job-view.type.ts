/** Public facts any offered collector may see. */
export interface JobSummary {
  submissionId: string;
  itemName: string;
  category: string;
  quantity: number;
  condition: string;
  weightLabel: string;
  district: string;
  distanceKm: number | null;
  photoPath: string;
  createdAt: string;
}

/** Contact details shown only to the collector holding the job. Never includes the handover code. */
export interface JobContact {
  address: string;
  instructions: string;
  ownerPhone: string | null;
  latitude: number;
  longitude: number;
  lockedUntil: string | null;
  attemptsLeft: number;
}

export type JobView =
  | ({ state: "open" } & JobSummary)
  | ({ state: "mine" } & JobSummary & JobContact)
  | ({ state: "done"; agreedPriceIdr: number | null } & JobSummary)
  | { state: "taken" }
  | { state: "closed" };
