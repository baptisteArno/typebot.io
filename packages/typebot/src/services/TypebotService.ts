import { PrismaService } from "@typebot.io/prisma/effect";
import { Effect, Layer, ServiceMap } from "effect";

export class TypebotService extends ServiceMap.Service<
  TypebotService,
  {
    findUnique: PrismaService["Service"]["typebot"]["findUnique"];
  }
>()("@typebot/TypebotService") {
  static readonly layer = Layer.effect(
    TypebotService,
    Effect.gen(function* () {
      const prisma = yield* PrismaService;

      return TypebotService.of({
        findUnique: prisma.typebot.findUnique,
      });
    }),
  );
}

export const TypebotServiceLayer = TypebotService.layer;
