import { type PrismaFindError, PrismaService } from "@typebot.io/prisma/effect";
import type { Prisma } from "@typebot.io/prisma/types";
import { Effect, Layer, ServiceMap } from "effect";

export class ResultsService extends ServiceMap.Service<
  ResultsService,
  {
    count: PrismaService["Service"]["result"]["count"];
    findMany: PrismaService["Service"]["result"]["findMany"];
    findDistinctAnswerBlockIds: (
      input: {
        typebotId: string;
        createdAt?: Prisma.Prisma.DateTimeFilter;
      },
    ) => Effect.Effect<string[], PrismaFindError>;
  }
>()("@typebot/ResultsService") {
  static readonly layer = Layer.effect(
    ResultsService,
    Effect.gen(function* () {
      const prisma = yield* PrismaService;

      return ResultsService.of({
        count: prisma.result.count,
        findMany: prisma.result.findMany,
        findDistinctAnswerBlockIds: Effect.fn("findDistinctAnswerBlockIds")(
          function* ({
            typebotId,
            createdAt,
          }: {
            typebotId: string;
            createdAt?: Prisma.Prisma.DateTimeFilter;
          }) {
            const answerV2BlockIds = yield* prisma.answerV2.findMany({
              where: {
                result: { typebotId, createdAt },
              },
              distinct: ["blockId"],
              select: { blockId: true },
            });
            const answerBlockIds = yield* prisma.answer.findMany({
              where: {
                result: { typebotId, createdAt },
              },
              distinct: ["blockId"],
              select: { blockId: true },
            });
            const allBlockIds = new Set([
              ...answerV2BlockIds.map((a) => a.blockId),
              ...answerBlockIds.map((a) => a.blockId),
            ]);
            return [...allBlockIds];
          },
        ),
      });
    }),
  );
}

export const ResultsServiceLayer = ResultsService.layer;
