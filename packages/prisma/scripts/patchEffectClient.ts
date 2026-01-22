import { constants } from "fs";
import { access, readFile, writeFile } from "fs/promises";
import { join } from "path";

type Operation = "createManyAndReturn" | "updateManyAndReturn";

const effectClientPath = join(__dirname, "../.effect/index.ts");
const prismaClientTypesPath = join(
  __dirname,
  "../../../node_modules/.prisma/client/index.d.ts",
);

const canRead = async (path: string) => {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
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
  const [hasEffectClient, hasPrismaTypes] = await Promise.all([
    canRead(effectClientPath),
    canRead(prismaClientTypesPath),
  ]);

  if (!hasEffectClient || !hasPrismaTypes) return;

  const prismaTypes = await readFile(prismaClientTypesPath, "utf8");
  const supportsCreateManyAndReturn = prismaTypes.includes(
    "CreateManyAndReturnArgs",
  );
  const supportsUpdateManyAndReturn = prismaTypes.includes(
    "UpdateManyAndReturnArgs",
  );

  if (supportsCreateManyAndReturn && supportsUpdateManyAndReturn) return;

  let effectClient = await readFile(effectClientPath, "utf8");

  if (!supportsCreateManyAndReturn)
    effectClient = removeOperationBlock(effectClient, "createManyAndReturn");
  if (!supportsUpdateManyAndReturn)
    effectClient = removeOperationBlock(effectClient, "updateManyAndReturn");

  await writeFile(effectClientPath, effectClient);
};
