import { rename } from "node:fs/promises";
import { watch } from "node:fs";
import path from "node:path";

const OUTFILE = "weather.exe";
const WATCHED = [path.resolve("src"), path.resolve("index.ts")];

const pkg = (await Bun.file("package.json").json()) as { name?: string };
const BUILT_NAME = `${pkg.name ?? "app"}.exe`;

async function build(): Promise<void> {
  try {
    const start = performance.now();
    await Bun.build({
      entrypoints: [path.resolve("index.ts")],
      compile: true,
    });
    if (BUILT_NAME !== OUTFILE) {
      await rename(BUILT_NAME, OUTFILE);
    }
    const ms = (performance.now() - start).toFixed(0);
    print(`[${new Date().toLocaleTimeString()}] binario regenerado (${ms} ms) -> ${OUTFILE}\n`);
  } catch (error) {
    print(`Error de compilación: ${error instanceof Error ? error.message : "desconocido"}\n`);
  }
}

let timer: ReturnType<typeof setTimeout> | undefined;
function scheduleBuild(): void {
  clearTimeout(timer);
  timer = setTimeout(() => {
    void build();
  }, 200);
}

await build();
for (const target of WATCHED) {
  watch(target, { recursive: true }, (_event, filename) => {
    if (filename?.endsWith("ts") || filename?.endsWith("json")) scheduleBuild();
  });
}
print(`Observando cambios en src/ e index.ts... (Ctrl+C para salir)\n`);

function print(text: string): void {
  Bun.write(Bun.stdout, text);
}
