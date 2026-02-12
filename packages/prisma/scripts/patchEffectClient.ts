import { constants } from "fs";
import { access, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";

type Operation =
  | "createManyAndReturn"
  | "updateManyAndReturn"
  | "$queryRawTyped";

const effectClientPath = join(__dirname, "../.effect/index.ts");
const prismaClientTypesRelativePaths = [
  "node_modules/.prisma/client/index.d.ts",
  "node_modules/@prisma/client/index.d.ts",
];
const effectDiagnosticsDirective =
  "/** @effect-diagnostics effectFnOpportunity:skip-file */";

const canRead = async (path: string) => {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
};

const findUp = async (start: string, relativePath: string) => {
  let current = start;

  while (true) {
    const candidate = join(current, relativePath);
    if (await canRead(candidate)) return candidate;

    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
};

const findPrismaClientTypesPath = async () => {
  const roots = [__dirname, process.cwd()];

  for (const root of roots) {
    for (const relativePath of prismaClientTypesRelativePaths) {
      const found = await findUp(root, relativePath);
      if (found) return found;
    }
  }

  return null;
};

const removeOperationBlock = (contents: string, operation: Operation) => {
  const lines = contents.split("\n");
  const output: string[] = [];
  let skipping = false;

  for (const line of lines) {
    if (!skipping && line.includes(`${operation}:`)) {
      skipping = true;
      continue;
    }

    if (skipping) {
      if (line.trim() === "),") {
        skipping = false;
        continue;
      }
      continue;
    }

    output.push(line);
  }

  return output.join("\n");
};

const disableEffectFnOpportunity = (contents: string) =>
  contents.startsWith(effectDiagnosticsDirective)
    ? contents
    : `${effectDiagnosticsDirective}\n${contents}`;

export const patchEffectClient = async () => {
  const hasEffectClient = await canRead(effectClientPath);
  if (!hasEffectClient) return;

  const prismaClientTypesPath = await findPrismaClientTypesPath();
  if (!prismaClientTypesPath) return;

  const prismaTypes = await readFile(prismaClientTypesPath, "utf8");
  const supportsCreateManyAndReturn = prismaTypes.includes(
    "CreateManyAndReturnArgs",
  );
  const supportsUpdateManyAndReturn = prismaTypes.includes(
    "UpdateManyAndReturnArgs",
  );
  const supportsQueryRawTyped = prismaTypes.includes("$queryRawTyped");

  const originalEffectClient = await readFile(effectClientPath, "utf8");
  let effectClient = originalEffectClient;
  effectClient = disableEffectFnOpportunity(effectClient);

  if (!supportsCreateManyAndReturn)
    effectClient = removeOperationBlock(effectClient, "createManyAndReturn");
  if (!supportsUpdateManyAndReturn)
    effectClient = removeOperationBlock(effectClient, "updateManyAndReturn");
  if (!supportsQueryRawTyped)
    effectClient = removeOperationBlock(effectClient, "$queryRawTyped");

  if (effectClient === originalEffectClient) return;

  await writeFile(effectClientPath, effectClient);
};
