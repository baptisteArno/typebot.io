import { PrismaService } from "@typebot.io/prisma/effect";
import type { TypebotId } from "@typebot.io/shared-primitives/domain";
import type { UserId } from "@typebot.io/user/schemas";
import { Effect, Layer } from "effect";
import { TypebotAuthorization } from "../application/TypebotAuthorization";

export const PrismaTypebotAuthorization = Layer.effect(
  TypebotAuthorization,
  Effect.gen(function* () {
    const prisma = yield* PrismaService;

    const canReadTypebot = Effect.fn(
      "PrismaTypebotAuthorization.canReadTypebot",
    )(function* (typebotId: TypebotId, userId: UserId) {
      const typebot = yield* prisma.typebot
        .findFirst({
          where: {
            id: typebotId,
            OR: [
              { workspace: { members: { some: { userId } } } },
              { collaborators: { some: { userId } } },
            ],
          },
          select: { id: true },
        })
        .pipe(Effect.orDie);

      return typebot !== null;
    });

    const canWriteTypebot = Effect.fn(
      "PrismaTypebotAuthorization.canWriteTypebot",
    )(function* (typebotId: TypebotId, userId: UserId) {
      const typebot = yield* prisma.typebot
        .findFirst({
          where: {
            id: typebotId,
            OR: [
              { workspace: { members: { some: { userId } } } },
              {
                collaborators: {
                  some: {
                    userId,
                    type: { in: ["WRITE", "FULL_ACCESS"] },
                  },
                },
              },
            ],
          },
          select: { id: true },
        })
        .pipe(Effect.orDie);

      return typebot !== null;
    });

    return TypebotAuthorization.of({
      canReadTypebot,
      canWriteTypebot,
    });
  }),
);
