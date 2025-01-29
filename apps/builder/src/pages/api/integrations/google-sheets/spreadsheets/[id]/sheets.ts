import { getAuthenticatedUser } from "@/features/auth/helpers/getAuthenticatedUser";
import { setUser } from "@sentry/nextjs";
import { getAuthenticatedGoogleClient } from "@typebot.io/credentials/getAuthenticatedGoogleClient";
import {
  badRequest,
  methodNotAllowed,
  notAuthenticated,
} from "@typebot.io/lib/api/utils";
import { isDefined } from "@typebot.io/lib/utils";
import { GoogleSpreadsheet } from "google-spreadsheet";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return notAuthenticated(res);

  setUser({ id: user.id });
  if (req.method === "GET") {
    const credentialsId = req.query.credentialsId as string | undefined;
    if (!credentialsId) return badRequest(res);
    const spreadsheetId = req.query.id as string;
    const client = await getAuthenticatedGoogleClient(credentialsId);
    if (!client)
      return res
        .status(404)
        .send({ message: "Couldn't find credentials in database" });
    const doc = new GoogleSpreadsheet(spreadsheetId, client);
    await doc.loadInfo();
    return res.send({
      sheets: (
        await Promise.all(
          Array.from(Array(doc.sheetCount)).map(async (_, idx) => {
            const sheet = doc.sheetsByIndex[idx];
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
          }),
        )
      ).filter(isDefined),
    });
  }
  return methodNotAllowed(res);
};

export default handler;
