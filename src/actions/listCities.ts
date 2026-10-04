import { listCities } from "../storage/citiesStorage.ts";
import { getUnit } from "../storage/settingsStorage.ts";
import { printWeatherFor, printWarning } from "../presentation/output.ts";

export async function listCitiesWeather(): Promise<void> {
  const cities = await listCities();
  if (cities.length === 0) {
    printWarning("No hay ciudades registradas.");
    return;
  }
  const unit = await getUnit();
  for (const city of cities) {
    await printWeatherFor(city, unit);
  }
}
