import { stdout } from "node:process";
import { ask } from "./input.ts";
import { eraseLines, print, resetPrintedLines } from "./output.ts";
import { listCities } from "../storage/citiesStorage.ts";
import { getUnit } from "../storage/settingsStorage.ts";
import { brightCyan, cyan, moveUpEraseBelow, red, yellow } from "../utils/colors.ts";
import { LINE, MENU_LINES } from "../utils/constants.ts";
import { showDefaultCityWeather } from "../actions/getWeather.ts";
import { listCitiesWeather } from "../actions/listCities.ts";
import { addCityAction } from "../actions/addCity.ts";
import { removeCityAction } from "../actions/removeCity.ts";
import { setDefaultCityAction } from "../actions/setDefaultCity.ts";
import { updateUnitSettings } from "../actions/updateUnitSettings.ts";

export async function runMenu(): Promise<void> {
  await printMenuScreen();
  let menuDirty = false;
  resetPrintedLines();

  while (true) {
    const answer = await ask("Selecciona una opción: ");
    if (answer === null) {
      print(`\n${brightCyan("¡Hasta luego!")}\n`);
      break;
    }
    clearPreviousResult();
    switch (answer.trim()) {
      case "1": {
        await showDefaultCityWeather();
        break;
      }
      case "2": {
        await listCitiesWeather();
        break;
      }
      case "3": {
        await addCityAction();
        menuDirty = true;
        break;
      }
      case "4": {
        await removeCityAction();
        menuDirty = true;
        break;
      }
      case "5": {
        await setDefaultCityAction();
        menuDirty = true;
        break;
      }
      case "8": {
        menuDirty = (await updateUnitSettings()) || menuDirty;
        break;
      }
      case "9": {
        print(`\n${brightCyan("¡Hasta luego!")}\n`);
        process.exit(0);
      }
      default: {
        print(`\n${red("Opción inválida.")}\n\n`);
      }
    }
    if (menuDirty) {
      eraseMenuScreen();
      await printMenuScreen();
      menuDirty = false;
    }
  }
}

function clearPreviousResult(): void {
  const count = resetPrintedLines();
  eraseLines(count + 1);
}

function eraseMenuScreen(): void {
  stdout.write(`\r${moveUpEraseBelow(MENU_LINES)}`);
}

async function printMenuScreen(): Promise<void> {
  const cities = await listCities();
  const unit = await getUnit();
  print(`${cyan(LINE)}
${brightCyan("         WEATHER CLI")}
${cyan(LINE)}
  ${cyan("1.")} Clima de ciudad default
  ${cyan("2.")} Clima de todas las ciudades ${yellow(`(${cities.length})`)}
  ${cyan("3.")} Buscar y agregar ciudad
  ${cyan("4.")} Eliminar ciudad
  ${cyan("5.")} Establecer ciudad default
  ${cyan("8.")} Ajustes (°${unit})
  ${red("9.")} Salir
${cyan(LINE)}
`);
}
