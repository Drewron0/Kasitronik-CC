export interface ItemDetails {
  category: string;
  itemName: string;
  brandModel: string;
  quantity: string;
  condition: string;
  notes: string;
  weightKind: "unknown" | "actual" | "estimate";
  weightKg: string;
  weightMinKg: string;
  weightMaxKg: string;
}
