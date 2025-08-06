import { isReadWorkspaceFobidden } from "@/features/workspace/helpers/isReadWorkspaceFobidden";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import { getGoogleSpreadsheet } from "@typebot.io/credentials/getGoogleSpreadsheet";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";

export const getSpreadsheetName = authenticatedProcedure
  .input(
    z.object({
      workspaceId: z.string(),
      credentialsId: z.string(),
      spreadsheetId: z.string(),
    }),
  )
  .query(
    async ({
      input: { workspaceId, credentialsId, spreadsheetId },
      ctx: { user },
    }) => {
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceId,
        },
        select: {
          id: true,
          members: true,
          credentials: {
            where: {
              id: credentialsId,
            },
            select: {
              id: true,
              data: true,
              iv: true,
            },
          },
        },
      });
      if (!workspace || isReadWorkspaceFobidden(workspace, user))
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });

      const credentials = workspace.credentials[0];
      if (!credentials)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Credentials not found",
        });

      try {
        const googleSheet = await getGoogleSpreadsheet({
          credentialsId: credentials.id,
          spreadsheetId,
          workspaceId,
        });

        if (!googleSheet)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Google sheet not found",
          });

        await googleSheet.loadInfo();

        return { name: googleSheet.title };
      } catch (e) {
        return { name: "" };
      }
    },
  );
