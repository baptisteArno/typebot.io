import { TRPCError } from "@trpc/server";
import { getGoogleSpreadsheet } from "@typebot.io/credentials/getGoogleSpreadsheet";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { isReadWorkspaceFobidden } from "@/features/workspace/helpers/isReadWorkspaceFobidden";
import { authenticatedProcedure } from "@/helpers/server/trpc";

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
        const googleSheetResponse = await getGoogleSpreadsheet({
          credentialsId: credentials.id,
          spreadsheetId,
          workspaceId,
        });

        if (googleSheetResponse.type === "error")
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: googleSheetResponse.log.description,
          });

        await googleSheetResponse.spreadsheet.loadInfo();

        return { name: googleSheetResponse.spreadsheet.title };
      } catch (_e) {
        return { name: "" };
      }
    },
  );
