import type { SubmissionStatus } from "./submission-status.type";

export interface SubmissionItem {
  id: string;
  owner_id: string;
  category: "computers" | "phones" | "appliances" | "displays" | "components";
  item_name: string;
  brand_model: string;
  quantity: number;
  condition: "working" | "damaged" | "dead" | "dismantled";
  notes: string;
  weight_kind: "unknown" | "actual" | "estimate";
  weight_kg: number | null;
  weight_min_kg: number | null;
  weight_max_kg: number | null;
  photo_path: string;
  photo_url: string | null;
  status: SubmissionStatus;
  created_at: string;
  pickup_latitude: number | null;
  pickup_longitude: number | null;
  pickup_address: string | null;
  pickup_instructions: string | null;
}
