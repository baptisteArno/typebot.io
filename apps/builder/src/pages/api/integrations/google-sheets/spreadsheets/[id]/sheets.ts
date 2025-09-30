import { getGoogleSpreadsheet } from "@typebot.io/credentials/getGoogleSpreadsheet";
import {
  badRequest,
  methodNotAllowed,
  notAuthenticated,
} from "@typebot.io/lib/api/utils";
import { isDefined } from "@typebot.io/lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthenticatedUser } from "@/features/auth/helpers/getAuthenticatedUser";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return notAuthenticated(res);

  if (req.method === "GET") {
    const credentialsId = req.query.credentialsId as string | undefined;
    const workspaceId = req.query.workspaceId as string | undefined;
    if (!credentialsId || workspaceId) return badRequest(res);
    const spreadsheetId = req.query.id as string;
    const docResponse = await getGoogleSpreadsheet({
      credentialsId,
      spreadsheetId,
      workspaceId,
    });
    if (docResponse.type === "error")
      return res.status(404).send({ message: docResponse.log.description });

    try {
      await docResponse.spreadsheet.loadInfo();
      return res.send({
        sheets: (
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
        ).filter(isDefined),
      });
    } catch (err) {
      console.log(err);
      return res.status(404).send({
        message:
          "Couldn't find sheet, you maybe don't have permission to read it",
      });
    }
  }
  return methodNotAllowed(res);
};

export default handler;
