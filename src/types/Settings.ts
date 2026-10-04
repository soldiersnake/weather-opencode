import type { City } from "./City.ts";

export type Unit = "C" | "F";

export interface Settings {
  defaultCity: City | null;
  cities: City[];
  unit: Unit;
}
