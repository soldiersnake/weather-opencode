# AGENTS.md

## Project Overview

Weather CLI - a working console application that asks for a city name and shows the weather (temperature, feels-like, wind, WMO description). Compiled into an executable binary.

- **Runtime:** Bun.js (TypeScript)
- **Weather source:** Open-Meteo API (no API key needed)
  - Geocoding: `https://geocoding-api.open-meteo.com/v1/search?name=X&count=10&language=es&format=json`
  - Forecast: `https://api.open-meteo.com/v1/forecast?latitude=A&longitude=B&current=temperature_2m,apparent_temperature,wind_speed_10m,weather_code`
- **Data:** `~/.config/weather-cli/data.json` (city list, default city, °C/°F setting). A legacy local `data.json` in the project folder is migrated automatically on first run.

## Structure

Follows `references/file-system.md`:

- `index.ts` - entry point, runs the menu
- `src/actions/` - one module per menu action: `getWeather.ts` (default city weather), `listCities.ts` (weather of all saved cities), `addCity.ts` `removeCity.ts` `setDefaultCity.ts`, `updateUnitSettings.ts`
- `src/presentation/` - `menu.ts` (bucle + selección + borrado de respuesta anterior), `input.ts` (manual stdin reader, Bun readline loses buffered piped input on Windows), `output.ts` (print helpers, weather view con tabla de 7 días, line counting)
- `src/storage/` - `dataFile.ts` (JSON at `~/.config/weather-cli/`, migration of legacy local data.json), `citiesStorage.ts` (cities + default), `settingsStorage.ts` (unit)
- `src/api/` - `geocoding.ts` (city → candidates), `weather.ts` (forecast + WMO descriptions + daily parse)
- `src/types/` - `City.ts`, `Weather.ts`, `Settings.ts`, `MenuOption.ts`
- `src/utils/` - `constants.ts`, `format.ts` (día corto, °C→°F), `colors.ts` (ANSI, VT enable via kernel32 through bun:ffi; disabled on redirect), `loading.ts` (spinner ruta aquí), `validation.ts`
- `src/watch-build.ts` - dev watcher (custom, porque `bun build --watch` no se recompila en Windows)
- `src/build.ts` - build script usado por `bun run build`; parametrizable con env vars `TARGET` (`bun-windows-x64` por defecto) y `OUTFILE` (`weather`) para cross-compilar (Bun `--compile` con target/outfile explícitos)
- `.github/workflows/release.yml` - Release automático en push a `main`: compara la versión de `package.json` con la del commit anterior; si cambió (o ejecución manual con input `version`) corre tests, compila binarios linux-x64, darwin-arm64 y windows-x64, y publica tag `vX.Y.Z` + GitHub Release (`softprops/action-gh-release@v2`). Verificado con actionlint.
- `tests/` - bun tests with mocked `fetch` and temp-dir storage (`bun run test`)

## Commands

```bash
bun install        # install dependencies
bun run start      # run the app (index.ts)
bun run dev        # run the app with watch mode (restarts on file changes)
bun run build      # compile executable binary: weather.exe (Windows) - llama a src/build.ts (TARGET/OUTFILE por env)
bun run build:watch # watch src/ and index.ts, regenerate the binary on every change
bun run test       # bun test
bun init           # (already done) scaffold
```

Note: `bun run build:watch` uses `src/watch-build.ts` (custom watcher) because `bun build --watch` does not rebuild on Windows. `Bun.build({ compile: true })` names the output from `package.json` "name", so the watcher renames `02-weather.exe` to `weather.exe`.

## Notes

- Project is in Spanish (README and CLI output are in Spanish). Keep UI strings in Spanish.
- `tsconfig.json` uses strict mode with `noUncheckedIndexedAccess` and `verbatimModuleSyntax`; write code accordingly.
- On Windows, Bun buffers redirected stdout until process exit; the menu path on "Salir"/EOF calls `process.exit(0)` so output is flushed. Piping multiple lines into the app works but fast piped-write may drop lines; test with files or delays.
- Salvage lesson: do NOT rewrite UTF-8 source with `Get-Content`/`Set-Content` (PowerShell reads ANSI and corrupts accents); edit files with the editor tools instead.
