import { readFileSync } from "node:fs";

const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);

const range = pkg.engines?.node;
if (!range) {
  process.exit(0);
}

const match = range.match(/^>=(\d+)\s+<(\d+)$/);
if (!match) {
  throw new Error(
    `check-node-version.mjs only understands ">=X <Y" ranges, got: "${range}"`,
  );
}

const [, min, max] = match.map(Number);
const major = Number(process.versions.node.split(".")[0]);

if (major < min || major >= max) {
  console.error(
    `\n✖ Node ${process.version} does not satisfy the required range "${range}" (see .nvmrc).\n` +
      `  Switch to Node ${min}.x before running Yarn commands in this repo.\n`,
  );
  process.exit(1);
}
