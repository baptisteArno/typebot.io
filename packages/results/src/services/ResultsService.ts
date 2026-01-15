import { type PrismaFindError, PrismaService } from "@typebot.io/prisma/effect";
import { Context, Effect, Layer } from "effect";

export class ResultsService extends Context.Tag("@typebot/ResultsService")<
  ResultsService,
  {
    count: PrismaService["result"]["count"];
    findMany: PrismaService["result"]["findMany"];
    findDistinctAnswerBlockIds: (
      typebotId: string,
    ) => Effect.Effect<string[], PrismaFindError>;
  }
>() {}

export const ResultsServiceLayer = Layer.effect(
  ResultsService,
  Effect.gen(function* () {
    const prisma = yield* PrismaService;

    return {
      count: prisma.result.count,
      findMany: prisma.result.findMany,
      findDistinctAnswerBlockIds: Effect.fn("findDistinctAnswerBlockIds")(
        function* (typebotId: string) {
          const answerV2BlockIds = yield* prisma.answerV2.findMany({
            where: {
              result: { typebotId },
            },
            distinct: ["blockId"],
            select: { blockId: true },
          });
          const answerBlockIds = yield* prisma.answer.findMany({
            where: {
              result: { typebotId },
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
    };
  }),
);
