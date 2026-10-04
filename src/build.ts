// Compila el binario con bun build --compile, parametrizable por entorno.
// TARGET: bun-windows-x64 (por defecto), bun-linux-x64, bun-linux-arm64,
//         bun-darwin-x64 o bun-darwin-arm64 (cross-compilación de Bun).
// OUTFILE: ruta/nombre de salida (por defecto "weather"; en Windows se
//          añade .exe si falta).

const SUPPORTED_TARGETS = [
  "bun-windows-x64",
  "bun-windows-arm64",
  "bun-linux-x64",
  "bun-linux-arm64",
  "bun-darwin-x64",
  "bun-darwin-arm64",
] as const;

type Target = (typeof SUPPORTED_TARGETS)[number];

const target: Target = (process.env.TARGET as Target | undefined) ?? "bun-windows-x64";
let outfile = process.env.OUTFILE ?? "weather";
if (target.startsWith("bun-windows") && !outfile.endsWith(".exe")) {
  outfile += ".exe";
}

const build = await Bun.build({
  entrypoints: ["index.ts"],
  compile: { target, outfile },
});

if (!build.success) {
  console.error(`Error de compilación (${target}):`);
  for (const message of build.logs) {
    console.error(String(message));
  }
  process.exit(1);
}

console.log(`Binario compilado: ${outfile} (${target})`);
