import { isWriteWorkspaceForbidden } from "@/features/workspace/helpers/isWriteWorkspaceForbidden";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import { decrypt } from "@typebot.io/credentials/decrypt";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";

export const getCredentials = authenticatedProcedure
  .input(
    z.discriminatedUnion("scope", [
      z.object({
        scope: z.literal("workspace"),
        workspaceId: z.string(),
        credentialsId: z.string(),
      }),
      z.object({
        scope: z.literal("user"),
        credentialsId: z.string(),
      }),
    ]),
  )
  .query(async ({ input, ctx: { user } }) => {
    if (input.scope === "user") {
      const credentials = await prisma.userCredentials.findFirst({
        where: {
          id: input.credentialsId,
          userId: user.id,
        },
      });
      if (!credentials)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Credentials not found",
        });
      const credentialsData = await decrypt(credentials.data, credentials.iv);
      return {
        name: credentials.name,
        data: credentialsData,
      };
    }
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: input.workspaceId,
      },
      select: {
        id: true,
        members: true,
      },
    });
    if (!workspace || isWriteWorkspaceForbidden(workspace, user))
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workspace not found",
      });

    const credentials = await prisma.credentials.findFirst({
      where: {
        id: input.credentialsId,
      },
      select: {
        data: true,
        iv: true,
        name: true,
      },
    });

    if (!credentials)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Credentials not found",
      });

    const credentialsData = await decrypt(credentials.data, credentials.iv);

    return {
      name: credentials.name,
      data: credentialsData,
    };
  });
