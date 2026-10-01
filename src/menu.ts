import { ask, print as rawPrint } from "./input.ts";
import { searchCities } from "./geocoding.ts";
import {
  convertTemperature,
  describeWeatherCode,
  getWeather,
} from "./weather.ts";
import { loadSettings, saveSettings, toggleUnit } from "./storage.ts";
import { isSameCity } from "./validation.ts";
import { withSpinner } from "./loading.ts";
import { cyan, green, moveUpEraseBelow, red, yellow } from "./colors.ts";
import type { City, Settings } from "./types.ts";

const LINE = "════════════════════════════════════════";
let printedLines = 0;

function print(text: string): void {
  printedLines += countLines(text);
  rawPrint(text);
}

function countLines(text: string): number {
  let total = 0;
  for (const ch of text) {
    if (ch === "\n") total += 1;
  }
  return total;
}

function clearPreviousResult(): void {
  rawPrint(moveUpEraseBelow(printedLines));
  printedLines = 0;
}

function printMenu(settings: Settings): void {
  print(`${cyan(LINE)}
${cyan("         WEATHER CLI")}
${cyan(LINE)}
  1. Clima de ciudad default
  2. Clima de todas las ciudades (${settings.cities.length})
  3. Buscar y agregar ciudad
  4. Eliminar ciudad
  5. Establecer ciudad default
  8. Ajustes (°${settings.unit})
  9. Salir
${cyan(LINE)}
`);
}

async function printWeather(city: City, settings: Settings): Promise<void> {
  try {
    const weather = await withSpinner(`Consultando clima de ${city.name}...`, getWeather(city));
    const temp = convertTemperature(weather.temperature, settings.unit);
    const feels = convertTemperature(weather.apparentTemperature, settings.unit);
    print(
      `\nEl clima en ${city.name}, ${city.country}\nTemperatura: ${yellow(`${temp.toFixed(1)}°${settings.unit}`)} (Sensación: ${yellow(`${feels.toFixed(1)}°${settings.unit}`)})\n${describeWeatherCode(weather.code)}, viento ${weather.windSpeed.toFixed(0)} km/h\n\n`,
    );
  } catch (error: unknown) {
    print(`\n${red(`No se pudo obtener el clima de ${city.name}: ${error instanceof Error ? error.message : "error desconocido"}`)}\n\n`);
  }
}

function exitGracefully(): void {
  print(`\n${green("¡Hasta luego!")}\n`);
  process.exit(0);
}

async function findAndAddCity(settings: Settings): Promise<void> {
  const name = await ask("Nombre de la ciudad: ");
  if (name === null) return exitGracefully();
  if (!name.trim()) {
    print(`\n${yellow("El nombre de la ciudad no puede estar vacío.")}\n\n`);
    return;
  }
  try {
    const candidates = await withSpinner("Buscando ciudad...", searchCities(name.trim()));
    if (candidates.length === 0) {
      print(`\n${red(`No se encontró la ciudad "${name.trim()}".`)}\n\n`);
      return;
    }
    const city = candidates.length === 1 ? candidates[0]! : await pickCandidate(candidates);
    if (!city) return;
    if (settings.cities.some((c) => isSameCity(c, city))) {
      print(`\n${yellow(`${city.name} ya está registrada.`)}\n\n`);
      return;
    }
    settings.cities.push(city);
    if (!settings.defaultCity) settings.defaultCity = city;
    await saveSettings(settings);
    print(`\n${green(`Ciudad agregada: ${city.name}, ${city.country}`)}\n\n`);
  } catch (error: unknown) {
    print(`\n${red(`Error de conexión: ${error instanceof Error ? error.message : "error desconocido"}`)}\n\n`);
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
    print(`${yellow("Selección fuera de rango.")}\n\n`);
    return null;
  }
  return city;
}

function listCities(cities: City[]): void {
  print("\n");
  cities.forEach((city, i) => {
    print(`  ${i + 1}. ${city.name}, ${city.country}\n`);
  });
  print("\n");
}

async function removeCity(settings: Settings): Promise<void> {
  if (settings.cities.length === 0) {
    print(`\n${yellow("No hay ciudades registradas.")}\n\n`);
    return;
  }
  listCities(settings.cities);
  const answer = await ask("Número de la ciudad a eliminar (0 para cancelar): ");
  if (answer === null) return exitGracefully();
  if (answer.trim() === "0" || answer.trim() === "") {
    print(`\n${yellow("Operación cancelada.")}\n\n`);
    return;
  }
  const removed = settings.cities.splice(Number(answer.trim()) - 1, 1)[0];
  if (!removed) {
    print(`\n${red("Opción inválida.")}\n\n`);
    return;
  }
  if (settings.defaultCity && isSameCity(settings.defaultCity, removed)) {
    settings.defaultCity = settings.cities[0] ?? null;
  }
  await saveSettings(settings);
  print(`\n${green(`Ciudad eliminada: ${removed.name}`)}\n\n`);
}

async function setDefaultCity(settings: Settings): Promise<void> {
  if (settings.cities.length === 0) {
    print(`\n${yellow("No hay ciudades registradas. Busca y agrega una primero (opción 3).")}\n\n`);
    return;
  }
  listCities(settings.cities);
  const answer = await ask("Número de la ciudad predeterminada (0 para cancelar): ");
  if (answer === null) return exitGracefully();
  const city = settings.cities[Number(answer.trim()) - 1];
  if (!city) {
    print(`\n${yellow("Operación cancelada.")}\n\n`);
    return;
  }
  settings.defaultCity = city;
  await saveSettings(settings);
  print(`\n${green(`Ciudad predeterminada: ${city.name}`)}\n\n`);
}

async function showDefaultCityWeather(settings: Settings): Promise<void> {
  if (!settings.defaultCity) {
    print(`\n${yellow("No hay ciudad predeterminada. Busca y agrega una primero (opción 3).")}\n\n`);
    return;
  }
  await printWeather(settings.defaultCity, settings);
}

async function showAllCitiesWeather(settings: Settings): Promise<void> {
  if (settings.cities.length === 0) {
    print(`\n${yellow("No hay ciudades registradas.")}\n\n`);
    return;
  }
  for (const city of settings.cities) {
    await printWeather(city, settings);
  }
}

async function updateSettings(settings: Settings): Promise<void> {
  const answer = await ask("¿Unidad? (1) °C   (2) °F : ");
  if (answer === null) return exitGracefully();
  const choice = answer.trim();
  if (choice !== "1" && choice !== "2") {
    print(`\n${red("Opción inválida.")}\n\n`);
    return;
  }
  const newUnit = choice === "1" ? "C" : "F";
  if (newUnit !== settings.unit) {
    settings.unit = toggleUnit(settings.unit);
    await saveSettings(settings);
  }
  print(`\n${green(`Unidad configurada: °${settings.unit}`)}\n\n`);
}

export async function runMenu(): Promise<void> {
  const settings = await loadSettings();
  let firstIteration = true;

  let running = true;
  while (running) {
    if (firstIteration) {
      firstIteration = false;
    } else {
      clearPreviousResult();
    }
    printMenu(settings);
    const answer = await ask("Selecciona una opción: ");
    if (answer === null) {
      print(`\n${green("¡Hasta luego!")}\n`);
      break;
    }
    switch (answer.trim()) {
      case "1": {
        await showDefaultCityWeather(settings);
        break;
      }
      case "2": {
        await showAllCitiesWeather(settings);
        break;
      }
      case "3": {
        await findAndAddCity(settings);
        break;
      }
      case "4": {
        await removeCity(settings);
        break;
      }
      case "5": {
        await setDefaultCity(settings);
        break;
      }
      case "8": {
        await updateSettings(settings);
        break;
      }
      case "9": {
        exitGracefully();
        break;
      }
      default: {
        print(`\n${red("Opción inválida.")}\n\n`);
      }
    }
  }
}
