import { stdout } from "node:process";
import { colorsEnabled, cyan, eraseLine } from "./colors.ts";

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export async function withSpinner<T>(label: string, task: Promise<T>): Promise<T> {
  if (!colorsEnabled()) return await task;
  let index = 0;
  const interval = setInterval(() => {
    stdout.write(`\r\x1b[2K${cyan(FRAMES[index % FRAMES.length] ?? FRAMES[0]!)} ${label}`);
    index = (index + 1) % FRAMES.length;
  }, 80);
  try {
    return await task;
  } finally {
    clearInterval(interval);
    stdout.write(eraseLine());
  }
}
