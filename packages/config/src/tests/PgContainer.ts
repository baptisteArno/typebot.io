import { fileURLToPath } from "node:url";
import { Command } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";
import { PrismaClient } from "@prisma/client";
import { createPrismaAdapter } from "@typebot.io/prisma/createPrismaAdapter";
import { PrismaClientService, PrismaService } from "@typebot.io/prisma/effect";
import { Effect, Layer, Schema } from "effect";
import { inject } from "vitest";
import { seedDatabaseForTest } from "./seedDatabaseForTest";

export const PgContainerPrismaLayer = Layer.unwrapEffect(
  Effect.gen(function* () {
    const databaseUrl = inject("pgContainerDatabaseUri");

    yield* pushPrismaSchema(databaseUrl).pipe(Effect.orDie);

    const prismaLayer = Layer.provide(
      PrismaService.Default,
      Layer.succeed(
        PrismaClientService,
        new PrismaClient({
          adapter: createPrismaAdapter(databaseUrl),
        }),
      ),
    );

    yield* seedDatabaseForTest.pipe(Effect.provide(prismaLayer), Effect.orDie);

    return prismaLayer;
  }),
).pipe(Layer.provide(NodeContext.layer));

class DbPushCommandError extends Schema.TaggedError<DbPushCommandError>()(
  "DbPushCommandError",
  {
    output: Schema.String,
  },
) {}

const pushPrismaSchema = Effect.fn(function* (pgContainerUri: string) {
  const schemaPath = fileURLToPath(
    new URL("../../../prisma/postgresql/schema.prisma", import.meta.url),
  );

  const output = yield* Command.string(
    Command.make(
      "bunx",
      "prisma",
      "db",
      "push",
      "--schema",
      schemaPath,
      "--url",
      pgContainerUri,
      "--accept-data-loss",
    ),
  );

  if (output.toLowerCase().includes("error"))
    return yield* new DbPushCommandError({
      output,
    });
});
