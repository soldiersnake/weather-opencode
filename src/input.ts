import { stdin, stdout } from "node:process";

type Resolver = (line: string | null) => void;

const queue: string[] = [];
let pending: Resolver | null = null;
let ended = false;
let started = false;

function startReading(): void {
  if (started) return;
  started = true;
  stdin.setEncoding("utf8");
  let leftover = "";
  stdin.on("data", (chunk: string) => {
    leftover += chunk;
    const parts = leftover.split(/\r?\n/);
    leftover = parts.pop() ?? "";
    for (const line of parts) {
      deliver(line);
    }
  });
  stdin.on("end", () => {
    ended = true;
    if (leftover !== "") {
      deliver(leftover);
      leftover = "";
    }
    if (pending) {
      const resolve = pending;
      pending = null;
      resolve(null);
    }
  });
}

function deliver(line: string): void {
  if (pending) {
    const resolve = pending;
    pending = null;
    resolve(line);
    return;
  }
  queue.push(line);
}

export { stdout };

export function ask(question: string): Promise<string | null> {
  stdout.write(question);
  startReading();
  if (queue.length > 0) {
    const line = queue.shift();
    if (line !== undefined) return Promise.resolve(line);
  }
  if (ended) return Promise.resolve(null);
  return new Promise((resolve) => {
    pending = resolve;
  });
}

export function print(text: string): void {
  stdout.write(text);
}
