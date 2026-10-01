import type { City, CurrentWeather, DailyForecast, Unit } from "./types.ts";

interface ForecastResponse {
  current?:
    | {
        temperature_2m: number;
        apparent_temperature: number;
        wind_speed_10m: number;
        weather_code: number;
      }
    | undefined;
  daily?:
    | {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
      }
    | undefined;
}

const WMO_DESCRIPTIONS = new Map<number, string>([
  [0, "Despejado"],
  [1, "Mayormente despejado"],
  [2, "Parcialmente nublado"],
  [3, "Nublado"],
  [45, "Niebla"],
  [48, "Niebla con escarcha"],
  [51, "Llovizna ligera"],
  [53, "Llovizna moderada"],
  [55, "Llovizna intensa"],
  [56, "Llovizna helada ligera"],
  [57, "Llovizna helada intensa"],
  [61, "Lluvia ligera"],
  [63, "Lluvia moderada"],
  [65, "Lluvia intensa"],
  [66, "Lluvia helada ligera"],
  [67, "Lluvia helada intensa"],
  [71, "Nevada ligera"],
  [73, "Nevada moderada"],
  [75, "Nevada intensa"],
  [77, "Granos de nieve"],
  [80, "Chubascos ligeros"],
  [81, "Chubascos moderados"],
  [82, "Chubascos violentos"],
  [85, "Chubascos de nieve ligeros"],
  [86, "Chubascos de nieve intensos"],
  [95, "Tormenta eléctrica"],
  [96, "Tormenta con granizo ligero"],
  [99, "Tormenta con granizo intenso"],
]);

export function describeWeatherCode(code: number): string {
  return WMO_DESCRIPTIONS.get(code) ?? `Código desconocido (${code})`;
}

export function convertTemperature(celsius: number, unit: Unit): number {
  if (unit === "F") return celsius * (9 / 5) + 32;
  return celsius;
}

export async function getWeather(city: City): Promise<CurrentWeather> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,apparent_temperature,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`La API del clima respondió con error (${res.status}).`);
  }
  const data = (await res.json()) as ForecastResponse;
  const current = data.current;
  if (!current) {
    throw new Error(`No se pudo obtener el clima de ${city.name}.`);
  }
  return {
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    windSpeed: current.wind_speed_10m,
    code: current.weather_code,
    daily: parseDaily(data.daily),
  };
}

function parseDaily(
  daily:
    | {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
      }
    | undefined,
): DailyForecast[] {
  if (!daily) return [];
  const days: DailyForecast[] = [];
  for (let i = 0; i < daily.time.length; i += 1) {
    const date = daily.time[i];
    const max = daily.temperature_2m_max[i];
    const min = daily.temperature_2m_min[i];
    if (date === undefined || max === undefined || min === undefined) continue;
    days.push({ date, min, max });
  }
  return days;
}
