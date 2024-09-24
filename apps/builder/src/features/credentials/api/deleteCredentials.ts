import { isWriteWorkspaceForbidden } from "@/features/workspace/helpers/isWriteWorkspaceForbidden";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";

export const deleteCredentials = authenticatedProcedure
  .meta({
    openapi: {
      method: "DELETE",
      path: "/v1/credentials/:credentialsId",
      protect: true,
      summary: "Delete credentials",
      tags: ["Credentials"],
    },
  })
  .input(
    z.object({
      credentialsId: z.string(),
      workspaceId: z.string(),
    }),
  )
  .output(
    z.object({
      credentialsId: z.string(),
    }),
  )
  .mutation(
    async ({ input: { credentialsId, workspaceId }, ctx: { user } }) => {
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceId,
        },
        select: { id: true, members: { select: { userId: true, role: true } } },
      });
      if (!workspace || isWriteWorkspaceForbidden(workspace, user))
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });

      await prisma.credentials.delete({
        where: {
          id: credentialsId,
        },
      });
      return { credentialsId };
    },
  );
