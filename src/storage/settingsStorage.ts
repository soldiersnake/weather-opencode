import { readSettings, writeSettings } from "./dataFile.ts";
import type { Unit } from "../types/Settings.ts";

export async function getUnit(): Promise<Unit> {
  return (await readSettings()).unit;
}

export async function setUnit(unit: Unit): Promise<boolean> {
  const settings = await readSettings();
  if (settings.unit === unit) return false;
  settings.unit = unit;
  await writeSettings(settings);
  return true;
}
