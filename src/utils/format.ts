import type { Unit } from "../types/Settings.ts";

export function convertTemperature(celsius: number, unit: Unit): number {
  if (unit === "F") return celsius * (9 / 5) + 32;
  return celsius;
}

export function toggleUnit(unit: Unit): Unit {
  return unit === "C" ? "F" : "C";
}

const WEEKDAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

export function formatDay(iso: string): string {
  const parts = iso.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return iso;
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return `${WEEKDAYS[weekday] ?? ""} ${String(day).padStart(2, "0")}`;
}
