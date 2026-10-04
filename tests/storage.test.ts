import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { useDataFile } from "../src/storage/dataFile.ts";
import { addCity, getDefaultCity, listCities, removeCity, setDefaultCity } from "../src/storage/citiesStorage.ts";
import { getUnit, setUnit } from "../src/storage/settingsStorage.ts";
import { isSameCity } from "../src/utils/validation.ts";
import type { City } from "../src/types/City.ts";

const OTTAWA: City = {
  name: "Ottawa",
  country: "Canadá",
  latitude: 45.41117,
  longitude: -75.69812,
};

const BUENOS_AIRES: City = {
  name: "Buenos Aires",
  country: "Argentina",
  latitude: -34.61315,
  longitude: -58.37723,
};

describe("storage", () => {
  let tempFile: string;

  beforeEach(() => {
    const dir = mkdtempSync(path.join(tmpdir(), "weather-cli-test-"));
    tempFile = path.join(dir, "data.json");
    useDataFile(tempFile);
  });

  afterEach(() => {
    rmSync(path.dirname(tempFile), { recursive: true, force: true });
  });

  test("ciudades: agrega, lista, predetermina y elimina", async () => {
    expect(await listCities()).toHaveLength(0);
    expect(await getDefaultCity()).toBeNull();

    expect(await addCity(OTTAWA, true)).toBe(true);
    expect(await addCity(BUENOS_AIRES, false)).toBe(true);
    expect(await addCity(OTTAWA, false)).toBe(false);

    const cities = await listCities();
    expect(cities).toHaveLength(2);
    expect(cities[0] && isSameCity(cities[0], OTTAWA)).toBe(true);

    const added = await getDefaultCity();
    expect(added !== null && isSameCity(added, OTTAWA)).toBe(true);

    await setDefaultCity(BUENOS_AIRES);
    const defaulted = await getDefaultCity();
    expect(defaulted !== null && isSameCity(defaulted, BUENOS_AIRES)).toBe(true);

    const removed = await removeCity(BUENOS_AIRES);
    expect(removed !== null && isSameCity(removed, BUENOS_AIRES)).toBe(true);
    expect(await listCities()).toHaveLength(1);

    const defaultedAfterRemove = await getDefaultCity();
    expect(defaultedAfterRemove !== null && isSameCity(defaultedAfterRemove, OTTAWA)).toBe(true);
  });

  test("ciudades: sin archivo devuelve vacío y unit C", async () => {
    expect(await listCities()).toHaveLength(0);
    expect(await getUnit()).toBe("C");
  });

  test("settings: setUnit cambia y avisa si no cambió", async () => {
    expect(await setUnit("F")).toBe(true);
    expect(await getUnit()).toBe("F");
    expect(await setUnit("F")).toBe(false);
    expect(await setUnit("C")).toBe(true);
    expect(await getUnit()).toBe("C");
  });

  test("un archivo corrupto devuelve valores por defecto", async () => {
    mkdirSync(path.dirname(tempFile), { recursive: true });
    writeFileSync(tempFile, "{not-json");
    expect(await listCities()).toHaveLength(0);
    expect(await getDefaultCity()).toBeNull();
    expect(await getUnit()).toBe("C");
  });
});
