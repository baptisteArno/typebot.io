import { PrismaService } from "@typebot.io/prisma/effect";
import { Context, Effect, Layer } from "effect";

export class TypebotService extends Context.Tag("@typebot/TypebotService")<
  TypebotService,
  {
    findUnique: PrismaService["typebot"]["findUnique"];
  }
>() {}

export const TypebotServiceLayer = Layer.effect(
  TypebotService,
  Effect.gen(function* () {
    const prisma = yield* PrismaService;

    return {
      findUnique: prisma.typebot.findUnique,
    };
  }),
);
