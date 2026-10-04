import { existsSync, mkdirSync, renameSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import type { Settings } from "../types/Settings.ts";
import { isCity } from "../utils/validation.ts";

let dataFile = path.join(homedir(), ".config", "weather-cli", "data.json");

export function useDataFile(file: string): void {
  dataFile = file;
}

export function getDataFile(): string {
  return dataFile;
}

export async function readSettings(): Promise<Settings> {
  migrateLocalFile();
  return await Bun.file(dataFile)
    .json()
    .then((data: unknown) => parseSettings(data))
    .catch(() => defaultSettings());
}

export async function writeSettings(settings: Settings): Promise<void> {
  mkdirSync(path.dirname(dataFile), { recursive: true });
  await Bun.write(dataFile, JSON.stringify(settings, null, 2));
}

function migrateLocalFile(): void {
  const localFile = path.join(process.cwd(), "data.json");
  if (!existsSync(localFile) || existsSync(dataFile)) return;
  mkdirSync(path.dirname(dataFile), { recursive: true });
  renameSync(localFile, dataFile);
}

function defaultSettings(): Settings {
  return { defaultCity: null, cities: [], unit: "C" };
}

function parseSettings(data: unknown): Settings {
  const fallback = defaultSettings();
  if (typeof data !== "object" || data === null) return fallback;
  const raw = data as Record<string, unknown>;
  const defaultCity = isCity(raw["defaultCity"]) ? raw["defaultCity"] : null;
  const cities = Array.isArray(raw["cities"])
    ? raw["cities"].filter((c): c is NonNullable<Settings["defaultCity"]> => isCity(c))
    : fallback.cities;
  const unit: Settings["unit"] = raw["unit"] === "F" ? "F" : "C";
  return { defaultCity, cities, unit };
}
