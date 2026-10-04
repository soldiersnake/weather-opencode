import { searchCities } from "../api/geocoding.ts";
import { addCity as saveCity } from "../storage/citiesStorage.ts";
import { ask } from "../presentation/input.ts";
import { exitNow, print, printError, printOk, printWarning } from "../presentation/output.ts";
import { withSpinner } from "../utils/loading.ts";
import { yellow } from "../utils/colors.ts";
import type { City } from "../types/City.ts";

export async function addCityAction(): Promise<void> {
  const name = await ask("Nombre de la ciudad: ");
  if (name === null) exitNow();
  if (!name.trim()) {
    printWarning("El nombre de la ciudad no puede estar vacío.");
    return;
  }
  try {
    const candidates = await withSpinner("Buscando ciudad...", searchCities(name.trim()));
    if (candidates.length === 0) {
      printError(`No se encontró la ciudad "${name.trim()}".`);
      return;
    }
    const city = candidates.length === 1 ? candidates[0]! : await pickCandidate(candidates);
    if (!city) return;
    const saved = await saveCity(city, true);
    if (!saved) {
      printWarning(`${city.name} ya está registrada.`);
      return;
    }
    printOk(`Ciudad agregada: ${city.name}, ${city.country}`);
  } catch (error: unknown) {
    printError(`Error de conexión: ${error instanceof Error ? error.message : "error desconocido"}`);
  }
}

async function pickCandidate(candidates: City[]): Promise<City | null> {
  print("\nSe encontraron varias coincidencias:\n");
  candidates.forEach((candidate, i) => {
    print(`  ${i + 1}. ${candidate.name}, ${candidate.country}\n`);
  });
  const answer = await ask("Número de la ciudad (0 para cancelar): ");
  if (answer === null) return null;
  if (answer.trim() === "0" || answer.trim() === "") return null;
  const city = candidates[Number(answer.trim()) - 1];
  if (!city) {
    print(`\n${yellow("Selección fuera de rango.")}\n\n`);
    return null;
  }
  return city;
}
