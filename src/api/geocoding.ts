import type { City } from "../types/City.ts";

interface GeocodingResponse {
  results?:
    | {
        name: string;
        country: string;
        latitude: number;
        longitude: number;
      }[]
    | undefined;
}

export async function searchCities(name: string, count = 10): Promise<City[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=${count}&language=es&format=json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`La API de geocoding respondió con error (${res.status}).`);
  }
  const data = (await res.json()) as GeocodingResponse;
  const results = data.results ?? [];
  return results.map((result) => ({
    name: result.name,
    country: result.country,
    latitude: result.latitude,
    longitude: result.longitude,
  }));
}
