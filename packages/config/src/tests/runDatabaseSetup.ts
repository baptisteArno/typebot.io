import { PrismaClient } from "@prisma/client";
import { createPrismaAdapter } from "@typebot.io/prisma/createPrismaAdapter";
import { PrismaClientService, PrismaService } from "@typebot.io/prisma/effect";
import { Effect, Layer } from "effect";
import { pushPrismaSchema } from "./pushPrismaSchema";
import { seedDatabaseForTest } from "./seedDatabaseForTest";

const createSetupEffect = (databaseUrl: string) =>
  Effect.gen(function* () {
    yield* pushPrismaSchema(databaseUrl).pipe(Effect.orDie);

    const prismaLayer = Layer.provide(
      PrismaService.layer,
      Layer.succeed(
        PrismaClientService,
        new PrismaClient({
          adapter: createPrismaAdapter(databaseUrl),
        }),
      ),
    );

    yield* seedDatabaseForTest.pipe(Effect.provide(prismaLayer), Effect.orDie);
  });

export const runDatabaseSetup = (databaseUrl: string) =>
  Effect.runPromise(createSetupEffect(databaseUrl));
