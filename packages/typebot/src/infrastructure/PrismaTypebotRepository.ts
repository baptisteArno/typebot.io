import { PrismaService } from "@typebot.io/prisma/effect";
import type { TypebotId } from "@typebot.io/shared-primitives/domain";
import type { UserId } from "@typebot.io/user/schemas";
import { Effect, Layer } from "effect";
import { TypebotRepo } from "../application/TypebotRepo";

export const PrismaTypebotRepository = Layer.effect(
  TypebotRepo,
  Effect.gen(function* () {
    const prisma = yield* PrismaService;

    const canReadTypebot = Effect.fn("PrismaTypebotRepository.canReadTypebot")(
      function* (typebotId: TypebotId, userId: UserId) {
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
      },
    );

    const canWriteTypebot = Effect.fn(
      "PrismaTypebotRepository.canWriteTypebot",
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

    return TypebotRepo.of({
      canReadTypebot,
      canWriteTypebot,
    });
  }),
);
