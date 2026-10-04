import { getUnit, setUnit } from "../storage/settingsStorage.ts";
import { toggleUnit } from "../utils/format.ts";
import { ask } from "../presentation/input.ts";
import { exitNow, printError, printOk } from "../presentation/output.ts";

export async function updateUnitSettings(): Promise<boolean> {
  const answer = await ask("¿Unidad? (1) °C   (2) °F : ");
  if (answer === null) exitNow();
  const choice = answer.trim();
  if (choice !== "1" && choice !== "2") {
    printError("Opción inválida.");
    return false;
  }
  const newUnit = choice === "1" ? "C" : "F";
  const changed = await setUnit(newUnit);
  const unit = changed ? newUnit : await getUnit();
  printOk(`Unidad configurada: °${unit}`);
  return changed;
}
