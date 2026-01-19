import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import { resultWithAnswersSchema } from "@typebot.io/results/schemas/results";
import { isReadTypebotForbidden } from "@typebot.io/typebot/helpers/isReadTypebotForbidden";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";

export const getResultInputSchema = z.object({
  typebotId: z
    .string()
    .describe(
      "[Where to find my bot's ID?](../how-to#how-to-find-my-typebotid)",
    ),
  resultId: z
    .string()
    .describe(
      "The `resultId` is returned by the /startChat endpoint or you can find it by listing results with `/results` endpoint",
    ),
});

export const handleGetResult = async ({
  input,
  context: { user },
}: {
  input: z.infer<typeof getResultInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  const typebot = await prisma.typebot.findUnique({
    where: {
      id: input.typebotId,
    },
    select: {
      id: true,
      groups: true,
      workspace: {
        select: {
          isSuspended: true,
          isPastDue: true,
          members: {
            select: {
              userId: true,
            },
          },
        },
      },
      collaborators: {
        select: {
          userId: true,
          type: true,
        },
      },
    },
  });
  if (!typebot || (await isReadTypebotForbidden(typebot, user)))
    throw new ORPCError("NOT_FOUND", { message: "Typebot not found" });
  const results = await prisma.result.findMany({
    where: {
      id: input.resultId,
      typebotId: typebot.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      answers: {
        select: {
          blockId: true,
          content: true,
          createdAt: true,
        },
      },
      answersV2: {
        select: {
          blockId: true,
          content: true,
          createdAt: true,
        },
      },
    },
  });

  if (results.length === 0)
    throw new ORPCError("NOT_FOUND", { message: "Result not found" });

  const { answers, answersV2, ...result } = results[0];

  return {
    result: resultWithAnswersSchema.parse({
      ...result,
      answers: answers
        .concat(answersV2)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
    }),
  };
};
