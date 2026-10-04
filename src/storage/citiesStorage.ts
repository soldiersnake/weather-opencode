import { readSettings, writeSettings } from "./dataFile.ts";
import type { City } from "../types/City.ts";
import { isSameCity } from "../utils/validation.ts";

export async function listCities(): Promise<City[]> {
  return (await readSettings()).cities;
}

export async function getDefaultCity(): Promise<City | null> {
  return (await readSettings()).defaultCity;
}

export async function addCity(city: City, asDefaultIfEmpty: boolean): Promise<boolean> {
  const settings = await readSettings();
  if (settings.cities.some((c) => isSameCity(c, city))) return false;
  settings.cities.push(city);
  if (asDefaultIfEmpty && !settings.defaultCity) settings.defaultCity = city;
  await writeSettings(settings);
  return true;
}

export async function removeCity(city: City): Promise<City | null> {
  const settings = await readSettings();
  const index = settings.cities.findIndex((c) => isSameCity(c, city));
  if (index === -1) return null;
  const [removed] = settings.cities.splice(index, 1);
  if (settings.defaultCity && isSameCity(settings.defaultCity, removed!)) {
    settings.defaultCity = settings.cities[0] ?? null;
  }
  await writeSettings(settings);
  return removed ?? null;
}

export async function setDefaultCity(city: City): Promise<void> {
  const settings = await readSettings();
  settings.defaultCity = city;
  await writeSettings(settings);
}
