import type { Coordinates } from "./coordinates.interface";

export interface PickupLocation {
  coordinates: Coordinates | null;
  address: string;
  instructions: string;
  confirmed: boolean;
}
