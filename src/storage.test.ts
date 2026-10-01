import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { loadSettings, saveSettings, toggleUnit, useDataFile } from "./storage.ts";
import { isSameCity } from "./validation.ts";
import type { Settings } from "./types.ts";

const OTTAWA = {
  name: "Ottawa",
  country: "Canadá",
  latitude: 45.41117,
  longitude: -75.69812,
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

  test("guarda y relee las opciones", async () => {
    const settings: Settings = { defaultCity: OTTAWA, cities: [OTTAWA], unit: "F" };
    await saveSettings(settings);
    const loaded = await loadSettings();
    expect(loaded.unit).toBe("F");
    expect(loaded.cities).toHaveLength(1);
    expect(loaded.defaultCity !== null && isSameCity(loaded.defaultCity, OTTAWA)).toBe(true);
  });

  test("un archivo corrupto devuelve valores por defecto", async () => {
    mkdirSync(path.dirname(tempFile), { recursive: true });
    writeFileSync(tempFile, "{not-json");
    const loaded = await loadSettings();
    expect(loaded.defaultCity).toBeNull();
    expect(loaded.cities).toHaveLength(0);
    expect(loaded.unit).toBe("C");
  });

  test("sin archivo devuelve valores por defecto", async () => {
    const loaded = await loadSettings();
    expect(loaded.defaultCity).toBeNull();
    expect(loaded.cities).toHaveLength(0);
    expect(loaded.unit).toBe("C");
  });

  test("toggleUnit alterna C/F", () => {
    expect(toggleUnit("C")).toBe("F");
    expect(toggleUnit("F")).toBe("C");
  });
});
