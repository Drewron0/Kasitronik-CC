import type { PickupLocation } from "./pickup-location.interface";

export interface LocationFieldsProps {
  value: PickupLocation;
  disabled: boolean;
  signedIn: boolean;
  onChange: (value: PickupLocation) => void;
}
