import { afterEach, describe, expect, test } from "bun:test";
import { describeWeatherCode, getWeather } from "../src/api/weather.ts";
import { convertTemperature, toggleUnit } from "../src/utils/format.ts";
import type { City } from "../src/types/City.ts";

const REAL_FETCH = globalThis.fetch;

const OTTAWA: City = {
  name: "Ottawa",
  country: "Canadá",
  latitude: 45.41117,
  longitude: -75.69812,
};

function weatherResponse(current: unknown): Response {
  return new Response(JSON.stringify({ current }), { status: 200 });
}

function mockFetch(handler: () => Response): void {
  globalThis.fetch = (async () => handler()) as unknown as typeof fetch;
}

describe("getWeather", () => {
  afterEach(() => {
    globalThis.fetch = REAL_FETCH;
  });

  test("parsea temperatura, sensación, viento y código WMO", async () => {
    mockFetch(() =>
      weatherResponse({
        temperature_2m: 18.34,
        apparent_temperature: 19.2,
        wind_speed_10m: 12.4,
        weather_code: 2,
      }),
    );
    const weather = await getWeather(OTTAWA);
    expect(weather.temperature).toBeCloseTo(18.34);
    expect(weather.apparentTemperature).toBeCloseTo(19.2);
    expect(weather.windSpeed).toBeCloseTo(12.4);
    expect(weather.code).toBe(2);
    expect(weather.daily).toHaveLength(0);
  });

  test("parsea el pronóstico diario (7 días)", async () => {
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          current: {
            temperature_2m: 18.34,
            apparent_temperature: 19.2,
            wind_speed_10m: 12.4,
            weather_code: 2,
          },
          daily: {
            time: [
              "2026-10-02",
              "2026-10-03",
              "2026-10-04",
              "2026-10-05",
              "2026-10-06",
              "2026-10-07",
              "2026-10-08",
            ],
            temperature_2m_max: [21.4, 19.8, 20, 22.1, 23, 18.9, 17.2],
            temperature_2m_min: [11, 9.5, 10.1, 12, 13.3, 8.8, 7.7],
          },
        }),
        { status: 200 },
      )) as unknown as typeof fetch;
    const weather = await getWeather(OTTAWA);
    expect(weather.daily).toHaveLength(7);
    expect(weather.daily[0]!.date).toBe("2026-10-02");
    expect(weather.daily[0]!.min).toBeCloseTo(11);
    expect(weather.daily[6]!.max).toBeCloseTo(17.2);
  });

  test("daily incompleto: se descartan filas sin datos", async () => {
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          current: {
            temperature_2m: 18.34,
            apparent_temperature: 19.2,
            wind_speed_10m: 12.4,
            weather_code: 2,
          },
          daily: {
            time: ["2026-10-02", "2026-10-03"],
            temperature_2m_max: [21.4],
            temperature_2m_min: [11, 9.5],
          },
        }),
        { status: 200 },
      )) as unknown as typeof fetch;
    const weather = await getWeather(OTTAWA);
    expect(weather.daily).toHaveLength(1);
    expect(weather.daily[0]!.max).toBeCloseTo(21.4);
    expect(weather.daily[0]!.min).toBeCloseTo(11);
  });

  test("sin datos current lanza error", async () => {
    mockFetch(() => weatherResponse(null));
    expect(
      await getWeather(OTTAWA).then(
        () => false,
        () => true,
      ),
    ).toBe(true);
  });

  test("lanza error con HTTP != 200", async () => {
    mockFetch(() => new Response("boom", { status: 404 }));
    expect(
      await getWeather(OTTAWA).then(
        () => false,
        () => true,
      ),
    ).toBe(true);
  });
});

describe("describeWeatherCode", () => {
  test("describe códigos conocidos en español", () => {
    expect(describeWeatherCode(0)).toBe("Despejado");
    expect(describeWeatherCode(2)).toBe("Parcialmente nublado");
    expect(describeWeatherCode(61)).toBe("Lluvia ligera");
    expect(describeWeatherCode(95)).toBe("Tormenta eléctrica");
  });

  test("código desconocido devuelve mensaje genérico", () => {
    expect(describeWeatherCode(999)).toBe("Código desconocido (999)");
  });
});

describe("format", () => {
  test("convertTemperature C a F", () => {
    expect(convertTemperature(0, "F")).toBe(32);
    expect(convertTemperature(100, "F")).toBeCloseTo(212);
    expect(convertTemperature(20, "F")).toBe(68);
  });

  test("convertTemperature C a C es identidad", () => {
    expect(convertTemperature(21.5, "C")).toBe(21.5);
  });

  test("toggleUnit alterna C/F", () => {
    expect(toggleUnit("C")).toBe("F");
    expect(toggleUnit("F")).toBe("C");
  });
});
