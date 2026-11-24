export interface SubmissionForCollector {
  id: string;
  ownerId: string;
  status: "pending" | "accepted" | "picked_up" | "completed" | "cancelled";
  itemName: string;
  category: string;
  quantity: number;
  condition: string;
  weightLabel: string;
  photoPath: string;
  latitude: number;
  longitude: number;
  address: string;
  instructions: string;
  district: string;
  ownerPhone: string | null;
  collectorId: string | null;
  handoverCode: string | null;
  handoverAttempts: number;
  handoverLockedUntil: string | null;
  agreedPriceIdr: number | null;
  waveCount: number;
  lastWaveAt: string | null;
  createdAt: string;
}
