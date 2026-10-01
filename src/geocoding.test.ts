import { afterEach, describe, expect, test } from "bun:test";
import { searchCities } from "./geocoding.ts";
import type { City } from "./types.ts";

const REAL_FETCH = globalThis.fetch;
const FAKE_URL = "";

function successResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), { status: 200 });
}

function mockFetch(handler: (url: string | URL | Request) => Response): void {
  globalThis.fetch = (async (url: string | URL | Request) =>
    handler(url)) as unknown as typeof fetch;
}

describe("searchCities", () => {
  afterEach(() => {
    globalThis.fetch = REAL_FETCH;
  });

  test("parsea los resultados en ciudades", async () => {
    mockFetch(() =>
      successResponse({
        results: [
          { name: "Ottawa", country: "Canadá", latitude: 45.42, longitude: -75.7 },
          { name: "Ottawa", country: "EE.UU.", latitude: 40.05, longitude: -83.75 },
        ],
      }),
    );
    const cities: City[] = await searchCities("Ottawa");
    expect(cities).toHaveLength(2);
    expect(cities[0]!.name).toBe("Ottawa");
    expect(cities[0]!.country).toBe("Canadá");
    expect(cities[1]!.latitude).toBeCloseTo(40.05);
  });

  test("sin resultados devuelve lista vacía", async () => {
    mockFetch(() => successResponse({}));
    expect(await searchCities("xyzq")).toHaveLength(0);
  });

  test("agrega count y name codificados en la URL", async () => {
    let capturedUrl = FAKE_URL;
    mockFetch((url) => {
      capturedUrl = String(url);
      return successResponse({ results: [] });
    });
    await searchCities("Ciudad de México", 3);
    expect(capturedUrl).toContain("count=3");
    expect(capturedUrl).toContain("name=Ciudad%20de%20M%C3%A9xico");
  });

  test("lanza error con estado HTTP distinto de 200", async () => {
    mockFetch(() => new Response("boom", { status: 500 }));
    expect(
      await searchCities(" Ottawa ").then(
        () => false,
        () => true,
      ),
    ).toBe(true);
  });
});
