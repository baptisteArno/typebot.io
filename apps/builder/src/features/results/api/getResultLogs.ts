import { isReadTypebotForbidden } from "@/features/typebot/helpers/isReadTypebotForbidden";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import prisma from "@typebot.io/prisma";
import { logSchema } from "@typebot.io/results/schemas/results";
import { z } from "@typebot.io/zod";

export const getResultLogs = authenticatedProcedure
  .meta({
    openapi: {
      method: "GET",
      path: "/v1/typebots/{typebotId}/results/{resultId}/logs",
      protect: true,
      summary: "List result logs",
      tags: ["Results"],
    },
  })
  .input(
    z.object({
      typebotId: z
        .string()
        .describe(
          "[Where to find my bot's ID?](../how-to#how-to-find-my-typebotid)",
        ),
      resultId: z.string(),
    }),
  )
  .output(z.object({ logs: z.array(logSchema) }))
  .query(async ({ input: { typebotId, resultId }, ctx: { user } }) => {
    const typebot = await prisma.typebot.findUnique({
      where: {
        id: typebotId,
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
      throw new Error("Typebot not found");
    const logs = await prisma.log.findMany({
      where: {
        resultId,
      },
    });

    return { logs };
  });
