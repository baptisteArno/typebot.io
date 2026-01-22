import { constants } from "fs";
import { access, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";

type Operation = "createManyAndReturn" | "updateManyAndReturn";

const effectClientPath = join(__dirname, "../.effect/index.ts");
const prismaClientTypesRelativePaths = [
  "node_modules/.prisma/client/index.d.ts",
  "node_modules/@prisma/client/index.d.ts",
];

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

  console.log("[patchEffectClient] Searching Prisma client types", {
    roots,
    relativePaths: prismaClientTypesRelativePaths,
  });

  for (const root of roots) {
    for (const relativePath of prismaClientTypesRelativePaths) {
      const found = await findUp(root, relativePath);
      if (found) {
        console.log("[patchEffectClient] Found Prisma client types", {
          root,
          relativePath,
          found,
        });
        return found;
      }
    }
  }

  console.log("[patchEffectClient] Prisma client types not found", {
    roots,
    relativePaths: prismaClientTypesRelativePaths,
  });
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

export const patchEffectClient = async () => {
  const hasEffectClient = await canRead(effectClientPath);
  console.log("[patchEffectClient] Effect client path", {
    effectClientPath,
    hasEffectClient,
  });
  if (!hasEffectClient) {
    console.warn("Patching effect client skipped: Effect client not found.");
    return;
  }

  const prismaClientTypesPath = await findPrismaClientTypesPath();
  if (!prismaClientTypesPath) {
    console.warn(
      "Patching effect client skipped: Prisma client types not found.",
    );
    return;
  }

  const prismaTypes = await readFile(prismaClientTypesPath, "utf8");
  const supportsCreateManyAndReturn = prismaTypes.includes(
    "CreateManyAndReturnArgs",
  );
  const supportsUpdateManyAndReturn = prismaTypes.includes(
    "UpdateManyAndReturnArgs",
  );

  console.log("[patchEffectClient] Prisma client support flags", {
    prismaClientTypesPath,
    supportsCreateManyAndReturn,
    supportsUpdateManyAndReturn,
  });

  if (supportsCreateManyAndReturn && supportsUpdateManyAndReturn) {
    console.log(
      "[patchEffectClient] Skipping patch: Prisma client supports all operations.",
    );
    return;
  }

  let effectClient = await readFile(effectClientPath, "utf8");

  if (!supportsCreateManyAndReturn) {
    console.log(
      "[patchEffectClient] Removing createManyAndReturn operation block.",
    );
    effectClient = removeOperationBlock(effectClient, "createManyAndReturn");
  }
  if (!supportsUpdateManyAndReturn) {
    console.log(
      "[patchEffectClient] Removing updateManyAndReturn operation block.",
    );
    effectClient = removeOperationBlock(effectClient, "updateManyAndReturn");
  }

  await writeFile(effectClientPath, effectClient);
  console.log("✅ Effect client patched successfully.");
};
