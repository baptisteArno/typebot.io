import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { isWriteTypebotForbidden } from "../helpers/isWriteTypebotForbidden";

export const unpublishTypebot = authenticatedProcedure
  .meta({
    openapi: {
      method: "POST",
      path: "/v1/typebots/{typebotId}/unpublish",
      protect: true,
      summary: "Unpublish a typebot",
      tags: ["Typebot"],
    },
  })
  .input(
    z.object({
      typebotId: z
        .string()
        .describe(
          "[Where to find my bot's ID?](../how-to#how-to-find-my-typebotid)",
        ),
    }),
  )
  .output(
    z.object({
      message: z.literal("success"),
    }),
  )
  .mutation(async ({ input: { typebotId }, ctx: { user } }) => {
    const existingTypebot = await prisma.typebot.findFirst({
      where: {
        id: typebotId,
      },
      include: {
        collaborators: true,
        publishedTypebot: true,
        workspace: {
          select: {
            isSuspended: true,
            isPastDue: true,
            members: {
              select: {
                userId: true,
                role: true,
              },
            },
          },
        },
      },
    });
    if (!existingTypebot?.publishedTypebot)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Published typebot not found",
      });

    if (
      !existingTypebot.id ||
      (await isWriteTypebotForbidden(existingTypebot, user))
    )
      throw new TRPCError({ code: "NOT_FOUND", message: "Typebot not found" });

    await prisma.publicTypebot.deleteMany({
      where: {
        id: existingTypebot.publishedTypebot.id,
      },
    });

    return { message: "success" };
  });
