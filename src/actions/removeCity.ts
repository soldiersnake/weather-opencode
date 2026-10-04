import { listCities, removeCity as deleteCity } from "../storage/citiesStorage.ts";
import { ask } from "../presentation/input.ts";
import { exitNow, printCities, printError, printOk, printWarning } from "../presentation/output.ts";

export async function removeCityAction(): Promise<void> {
  const cities = await listCities();
  if (cities.length === 0) {
    printWarning("No hay ciudades registradas.");
    return;
  }
  printCities(cities);
  const answer = await ask("Número de la ciudad a eliminar (0 para cancelar): ");
  if (answer === null) exitNow();
  if (answer.trim() === "0" || answer.trim() === "") {
    printWarning("Operación cancelada.");
    return;
  }
  const city = cities[Number(answer.trim()) - 1];
  if (!city) {
    printError("Opción inválida.");
    return;
  }
  const removed = await deleteCity(city);
  printOk(`Ciudad eliminada: ${removed?.name ?? city.name}`);
}
