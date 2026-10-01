# AGENTS.md

## Project Overview

Weather CLI - a working console application that asks for a city name and shows the weather (temperature, feels-like, wind, WMO description). Compiled into an executable binary.

- **Runtime:** Bun.js (TypeScript)
- **Weather source:** Open-Meteo API (no API key needed)
  - Geocoding: `https://geocoding-api.open-meteo.com/v1/search?name=X&count=10&language=es&format=json`
  - Forecast: `https://api.open-meteo.com/v1/forecast?latitude=A&longitude=B&current=temperature_2m,apparent_temperature,wind_speed_10m,weather_code`
- **Data:** `~/.config/weather-cli/data.json` (city list, default city, °C/°F setting). A legacy local `data.json` in the project folder is migrated automatically on first run.

## Structure

- `index.ts` - entry point, runs the menu
- `src/menu.ts` - interactive numbered menu (Spanish UI), colors, clears previous answer before reprinting the menu
- `src/input.ts` - manual stdin reader (Bun's readline loses buffered piped input on Windows) + `print`, `stdout` exports
- `src/geocoding.ts` - city name → possible matches (list selection when ambiguous)
- `src/weather.ts` - forecast fetch + WMO code descriptions (Spanish) + °C→°F conversion
- `src/storage.ts` - load/save settings JSON in `~/.config/weather-cli/`
- `src/colors.ts` - ANSI colors, no dependencies (cyan menu, yellow temps, green ok, red error); disabled without TTY
- `src/loading.ts` - spinner for async HTTP requests (TTY only)
- `src/validation.ts` - `isCity` / `isSameCity` guards
- `src/types.ts` - shared types (`City`, `Unit`, `Settings`, `CurrentWeather`)
- `*.test.ts` - bun tests with mocked `fetch` and temp-dir storage

## Commands

```bash
bun install        # install dependencies
bun run start      # run the app (index.ts)
bun run dev        # run the app with watch mode (restarts on file changes)
bun run build      # compile executable binary: weather.exe (Windows) - user-added script
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
