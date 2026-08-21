import { isDefined, isNotDefined } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import { resultSchema } from "@typebot.io/results/schemas/results";
import { assertProductionEnvironment, confirmAction, runScript } from "./cli";

const bulkUpdate = async () => {
  assertProductionEnvironment();

  const results = resultSchema
    .pick({ id: true, variables: true })
    .array()
    .parse(
      await prisma.result.findMany({
        where: {
          variables: { equals: [] },
        },
        select: { variables: true, id: true },
      }),
    );

  const queries = results
    .map((result) => {
      if (
        result.variables.some((variable) => typeof variable.value !== "string")
      ) {
        return prisma.result.updateMany({
          where: { id: result.id },
          data: {
            variables: result.variables
              .map((variable) => ({
                ...variable,
                value:
                  typeof variable.value !== "string"
                    ? safeStringify(variable.value)
                    : variable.value,
              }))
              .filter(isDefined),
          },
        });
      }
    })
    .filter(isDefined);

  console.log(`Found ${queries.length} production results to update.`);
  if (!(await confirmAction({ message: "Apply these bulk updates?" }))) return;

  await prisma.$transaction(queries);
};

export const safeStringify = (val: unknown): string | null => {
  if (isNotDefined(val)) return null;
  if (typeof val === "string") return val;
  try {
    return JSON.stringify(val);
  } catch {
    console.warn("Failed to safely stringify variable value", val);
    return null;
  }
};

runScript(bulkUpdate);
