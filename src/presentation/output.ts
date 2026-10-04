import { stdout } from "./input.ts";
import { describeWeatherCode, getWeather } from "../api/weather.ts";
import { withSpinner } from "../utils/loading.ts";
import { convertTemperature, formatDay } from "../utils/format.ts";
import { brightCyan, colorsEnabled, cyan, green, moveUpEraseBelow, red, yellow } from "../utils/colors.ts";
import type { City } from "../types/City.ts";
import type { Unit } from "../types/Settings.ts";

let printedLines = 0;

export function print(text: string): void {
  printedLines += countLines(text);
  stdout.write(text);
}

export function countLines(text: string): number {
  let total = 0;
  for (const ch of text) {
    if (ch === "\n") total += 1;
  }
  return total;
}

export function resetPrintedLines(): number {
  const count = printedLines;
  printedLines = 0;
  return count;
}

export function eraseLines(count: number): void {
  if (!colorsEnabled()) return;
  stdout.write(`\r${moveUpEraseBelow(count)}`);
}

export function exitNow(): never {
  print(`\n${green("¡Hasta luego!")}\n`);
  process.exit(0);
}

export async function printWeatherFor(city: City, unit: Unit): Promise<void> {
  try {
    const weather = await withSpinner(`Consultando clima de ${city.name}...`, getWeather(city));
    const temp = convertTemperature(weather.temperature, unit);
    const feels = convertTemperature(weather.apparentTemperature, unit);
    print(
      `\n${brightCyan(`El clima en ${city.name}, ${city.country}`)}\nTemperatura: ${yellow(`${temp.toFixed(1)}°${unit}`)} (Sensación: ${yellow(`${feels.toFixed(1)}°${unit}`)})\n${describeWeatherCode(weather.code)}, viento ${yellow(`${weather.windSpeed.toFixed(0)} km/h`)}\n`,
    );
    printTable(weather.daily, unit);
    print("\n");
  } catch (error: unknown) {
    print(`\n${red(`No se pudo obtener el clima de ${city.name}: ${error instanceof Error ? error.message : "error desconocido"}`)}\n\n`);
  }
}

function printTable(
  daily: { date: string; min: number; max: number }[],
  unit: Unit,
): void {
  if (daily.length === 0) return;
  print(`\n  ${cyan("Día")}       ${cyan("Mínima")}    ${cyan("Máxima")}\n`);
  for (const day of daily.slice(0, 7)) {
    const min = convertTemperature(day.min, unit).toFixed(1);
    const max = convertTemperature(day.max, unit).toFixed(1);
    print(
      `  ${formatDay(day.date).padEnd(10)}${yellow(`${min}°${unit}`.padStart(9))}   ${yellow(`${max}°${unit}`.padStart(9))}\n`,
    );
  }
}

export function printCities(cities: City[]): void {
  print("\n");
  cities.forEach((city, i) => {
    print(`  ${i + 1}. ${city.name}, ${city.country}\n`);
  });
  print("\n");
}

export function printError(text: string): void {
  print(`\n${red(text)}\n\n`);
}

export function printOk(text: string): void {
  print(`\n${green(text)}\n\n`);
}

export function printWarning(text: string): void {
  print(`\n${yellow(text)}\n\n`);
}
