import { getDefaultCity } from "../storage/citiesStorage.ts";
import { getUnit } from "../storage/settingsStorage.ts";
import { printWeatherFor, printWarning } from "../presentation/output.ts";
import type { City } from "../types/City.ts";
import type { Unit } from "../types/Settings.ts";

export async function getWeatherOfCity(city: City, unit: Unit): Promise<void> {
  await printWeatherFor(city, unit);
}

export async function showDefaultCityWeather(): Promise<void> {
  const city = await getDefaultCity();
  if (!city) {
    printWarning("No hay ciudad predeterminada. Busca y agrega una primero (opción 3).");
    return;
  }
  const unit = await getUnit();
  await getWeatherOfCity(city, unit);
}
