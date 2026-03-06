import { PrismaClient } from "@prisma/client";
import { createPrismaAdapter } from "@typebot.io/prisma/createPrismaAdapter";
import { PrismaClientService, PrismaService } from "@typebot.io/prisma/effect";
import { Effect, Layer } from "effect";
import { inject } from "vitest";

export const PgContainerPrismaLayer = Layer.unwrap(
  Effect.sync(() => {
    const databaseUrl = inject("pgContainerDatabaseUri");

    return Layer.provide(
      PrismaService.layer,
      Layer.succeed(
        PrismaClientService,
        new PrismaClient({
          adapter: createPrismaAdapter(databaseUrl),
        }),
      ),
    );
  }),
);
