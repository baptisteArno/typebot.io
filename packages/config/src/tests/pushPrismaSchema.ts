import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { Effect, Schema } from "effect";

const execFileAsync = promisify(execFile);

class DbPushCommandError extends Schema.TaggedErrorClass<DbPushCommandError>()(
  "DbPushCommandError",
  {
    output: Schema.String,
  },
) {}

export const pushPrismaSchema = Effect.fn("pushPrismaSchema")(function* (
  pgContainerUri: string,
) {
  const schemaPath = fileURLToPath(
    new URL("../../../prisma/postgresql/schema.prisma", import.meta.url),
  );

  const output = yield* Effect.tryPromise({
    try: async () => {
      const { stdout, stderr } = await execFileAsync("bunx", [
        "prisma",
        "db",
        "push",
        "--schema",
        schemaPath,
        "--url",
        pgContainerUri,
        "--accept-data-loss",
      ]);
      return `${stdout}${stderr}`;
    },
    catch: (error) =>
      new DbPushCommandError({
        output: error instanceof Error ? error.message : String(error),
      }),
  });

  yield* Effect.log(output);

  if (output.toLowerCase().includes("error"))
    return yield* new DbPushCommandError({
      output,
    });
});
