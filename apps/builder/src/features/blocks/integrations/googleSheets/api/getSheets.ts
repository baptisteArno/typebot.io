import { ORPCError } from "@orpc/server";
import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { getGoogleSpreadsheet } from "@typebot.io/credentials/getGoogleSpreadsheet";
import { isDefined } from "@typebot.io/lib/utils";
import { z } from "@typebot.io/zod";

export const getSheets = authenticatedProcedure
  .input(
    z.object({
      credentialsId: z.string(),
      workspaceId: z.string().optional(),
      spreadsheetId: z.string(),
    }),
  )
  .handler(async ({ input: { credentialsId, workspaceId, spreadsheetId } }) => {
    const docResponse = await getGoogleSpreadsheet({
      credentialsId,
      spreadsheetId,
      workspaceId,
    });

    if (docResponse.type === "error")
      throw new ORPCError("NOT_FOUND", {
        message: docResponse.log.description,
      });

    try {
      await docResponse.spreadsheet.loadInfo();
      const sheets = (
        await Promise.all(
          Array.from(Array(docResponse.spreadsheet.sheetCount)).map(
            async (_, idx) => {
              const sheet = docResponse.spreadsheet.sheetsByIndex[idx];
              try {
                await sheet.loadHeaderRow();
              } catch (err) {
                if (err && typeof err === "object" && "message" in err)
                  console.log(err.message);
                return;
              }
              return {
                id: sheet.sheetId.toString(),
                name: sheet.title,
                columns: sheet.headerValues,
              };
            },
          ),
        )
      ).filter(isDefined);

      return { sheets };
    } catch (err) {
      console.log(err);
      throw new ORPCError("NOT_FOUND", {
        message:
          "Couldn't find sheet, you maybe don't have permission to read it",
      });
    }
  });
