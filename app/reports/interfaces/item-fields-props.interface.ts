import type { ItemDetails } from "./item-details.interface";

export interface ItemFieldsProps {
  details: ItemDetails;
  suggested: string[];
  onChange: (key: keyof ItemDetails, value: string) => void;
}
