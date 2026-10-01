import { dlopen, ptr, suffix } from "bun:ffi";

let enabled = process.stdout.isTTY === true;

const VT_ENABLE = 0x0004;

function enableVirtualTerminal(): boolean {
  if (process.platform !== "win32") return process.stdout.isTTY === true;
  try {
    const { symbols } = dlopen(`kernel32${suffix}`, {
      GetStdHandle: { args: (["i32"] as const), returns: "ptr" },
      GetConsoleMode: { args: (["ptr", "ptr"] as const), returns: "i32" },
      SetConsoleMode: { args: (["ptr", "u32"] as const), returns: "i32" },
    });
    const handle = symbols.GetStdHandle(-11);
    const mode = new Uint32Array(1);
    if (symbols.GetConsoleMode(handle, ptr(mode)) === 0) return false;
    if (symbols.SetConsoleMode(handle, mode[0]! | VT_ENABLE) === 0) return false;
    return true;
  } catch {
    return false;
  }
}

if (process.platform === "win32" && enabled) {
  enabled = enableVirtualTerminal();
}

function paint(code: string, text: string): string {
  if (!enabled) return text;
  return `\x1b[${code}m${text}\x1b[0m`;
}

export function cyan(text: string): string {
  return paint("36", text);
}

export function yellow(text: string): string {
  return paint("33", text);
}

export function green(text: string): string {
  return paint("32", text);
}

export function red(text: string): string {
  return paint("31", text);
}

export function moveUpEraseBelow(lines: number): string {
  if (!enabled) return "";
  return `\x1b[${lines}A\x1b[J`;
}

export function eraseLine(): string {
  if (!enabled) return "";
  return "\r\x1b[2K";
}

export function colorsEnabled(): boolean {
  return enabled;
}
