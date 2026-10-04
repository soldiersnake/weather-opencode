import { listCities, setDefaultCity as saveDefault } from "../storage/citiesStorage.ts";
import { ask } from "../presentation/input.ts";
import { exitNow, printCities, printOk, printWarning } from "../presentation/output.ts";
import type { City } from "../types/City.ts";

export async function setDefaultCityAction(): Promise<void> {
  const cities = await listCities();
  if (cities.length === 0) {
    printWarning("No hay ciudades registradas. Busca y agrega una primero (opción 3).");
    return;
  }
  printCities(cities);
  const answer = await ask("Número de la ciudad predeterminada (0 para cancelar): ");
  if (answer === null) exitNow();
  const city = cities[Number(answer.trim()) - 1] as City | undefined;
  if (!city) {
    printWarning("Operación cancelada.");
    return;
  }
  await saveDefault(city);
  printOk(`Ciudad predeterminada: ${city.name}`);
}
