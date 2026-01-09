import { ORPCError } from "@orpc/server";
import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { getGoogleSpreadsheet } from "@typebot.io/credentials/getGoogleSpreadsheet";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { isReadWorkspaceFobidden } from "@/features/workspace/helpers/isReadWorkspaceFobidden";

export const getSpreadsheetName = authenticatedProcedure
  .input(
    z.object({
      workspaceId: z.string(),
      credentialsId: z.string(),
      spreadsheetId: z.string(),
    }),
  )
  .handler(
    async ({
      input: { workspaceId, credentialsId, spreadsheetId },
      context: { user },
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
        throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

      const credentials = workspace.credentials[0];
      if (!credentials)
        throw new ORPCError("NOT_FOUND", { message: "Credentials not found" });

      try {
        const googleSheetResponse = await getGoogleSpreadsheet({
          credentialsId: credentials.id,
          spreadsheetId,
          workspaceId,
        });

        if (googleSheetResponse.type === "error")
          throw new ORPCError("BAD_REQUEST", {
            message: googleSheetResponse.log.description,
          });

        await googleSheetResponse.spreadsheet.loadInfo();

        return { name: googleSheetResponse.spreadsheet.title };
      } catch (_e) {
        return { name: "" };
      }
    },
  );
