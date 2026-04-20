import { ORPCError } from "@orpc/server";
import { getGoogleSpreadsheet } from "@typebot.io/credentials/getGoogleSpreadsheet";
import { isDefined } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { isReadWorkspaceFobidden } from "@/features/workspace/helpers/isReadWorkspaceFobidden";

export const getSheetsInputSchema = z.object({
  credentialsId: z.string(),
  workspaceId: z.string().min(1),
  spreadsheetId: z.string(),
});

export const handleGetSheets = async ({
  input: { credentialsId, workspaceId, spreadsheetId },
  context: { user },
}: {
  input: z.infer<typeof getSheetsInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
    },
    select: {
      id: true,
      members: true,
    },
  });
  if (!workspace || isReadWorkspaceFobidden(workspace, user))
    throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

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
};
