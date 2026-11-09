import type { Coordinates } from "./coordinates.interface";

export interface MapPickerProps {
  coordinates: Coordinates | null;
  disabled: boolean;
  onSelect: (coordinates: Coordinates) => void;
}
