import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import { env } from "@typebot.io/env";
import { removeObjectsFromTypebot } from "@typebot.io/lib/s3/removeObjectsRecursively";
import prisma from "@typebot.io/prisma";
import { archiveResults } from "@typebot.io/results/archiveResults";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import { z } from "@typebot.io/zod";
import { isWriteTypebotForbidden } from "../helpers/isWriteTypebotForbidden";

export const deleteTypebot = authenticatedProcedure
  .meta({
    openapi: {
      method: "DELETE",
      path: "/v1/typebots/{typebotId}",
      protect: true,
      summary: "Delete a typebot",
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
      select: {
        id: true,
        groups: true,
        workspace: {
          select: {
            id: true,
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
        collaborators: {
          select: {
            userId: true,
            type: true,
          },
        },
      },
    });
    if (
      !existingTypebot?.id ||
      (await isWriteTypebotForbidden(existingTypebot, user))
    )
      throw new TRPCError({ code: "NOT_FOUND", message: "Typebot not found" });

    const { success } = await archiveResults(prisma)({
      typebot: {
        id: typebotId,
        workspaceId: existingTypebot.workspace.id,
        groups: existingTypebot.groups as Typebot["groups"],
      },
      resultsFilter: { typebotId },
    });
    if (!success)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to archive results",
      });
    await prisma.publicTypebot.deleteMany({
      where: { typebotId },
    });
    await prisma.typebot.updateMany({
      where: { id: typebotId },
      data: { isArchived: true, publicId: null, customDomain: null },
    });
    if (env.S3_BUCKET)
      await removeObjectsFromTypebot({
        workspaceId: existingTypebot.workspace.id,
        typebotId,
      });
    return {
      message: "success",
    };
  });
