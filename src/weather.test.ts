import { afterEach, describe, expect, test } from "bun:test";
import { convertTemperature, describeWeatherCode, getWeather } from "./weather.ts";
import type { City } from "./types.ts";

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

describe("convertTemperature", () => {
  test("C a F", () => {
    expect(convertTemperature(0, "F")).toBe(32);
    expect(convertTemperature(100, "F")).toBeCloseTo(212);
    expect(convertTemperature(20, "F")).toBe(68);
  });

  test("C a C es identidad", () => {
    expect(convertTemperature(21.5, "C")).toBe(21.5);
  });
});
