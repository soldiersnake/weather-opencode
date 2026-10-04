import type { City } from "../types/City.ts";

export function isCity(value: unknown): value is City {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c["name"] === "string" &&
    typeof c["country"] === "string" &&
    typeof c["latitude"] === "number" &&
    typeof c["longitude"] === "number"
  );
}

export function isSameCity(a: City, b: City): boolean {
  return a.latitude === b.latitude && a.longitude === b.longitude;
}
