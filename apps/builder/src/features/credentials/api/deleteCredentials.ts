import { ORPCError } from "@orpc/server";
import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { isWriteWorkspaceForbidden } from "@/features/workspace/helpers/isWriteWorkspaceForbidden";

export const deleteCredentials = authenticatedProcedure
  .input(
    z.discriminatedUnion("scope", [
      z.object({
        scope: z.literal("workspace"),
        credentialsId: z.string(),
        workspaceId: z.string(),
      }),
      z.object({
        scope: z.literal("user"),
        credentialsId: z.string(),
      }),
    ]),
  )
  .output(
    z.object({
      credentialsId: z.string(),
    }),
  )
  .handler(async ({ input, context: { user } }) => {
    if (input.scope === "user") {
      await prisma.userCredentials.delete({
        where: {
          id: input.credentialsId,
          userId: user.id,
        },
      });
      return { credentialsId: input.credentialsId };
    }

    const workspace = await prisma.workspace.findFirst({
      where: {
        id: input.workspaceId,
      },
      select: { id: true, members: { select: { userId: true, role: true } } },
    });
    if (!workspace || isWriteWorkspaceForbidden(workspace, user))
      throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

    await prisma.credentials.delete({
      where: {
        id: input.credentialsId,
      },
    });
    return { credentialsId: input.credentialsId };
  });
