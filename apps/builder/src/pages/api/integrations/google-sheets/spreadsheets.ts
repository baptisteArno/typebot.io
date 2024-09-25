import { getAuthenticatedUser } from "@/features/auth/helpers/getAuthenticatedUser";
import { getAuthenticatedGoogleClient } from "@/lib/googleSheets";
import { drive } from "@googleapis/drive";
import { setUser } from "@sentry/nextjs";
import {
  badRequest,
  methodNotAllowed,
  notAuthenticated,
} from "@typebot.io/lib/api/utils";
import type { NextApiRequest, NextApiResponse } from "next";

// TODO: Delete now that we use Google Drive Picker
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return notAuthenticated(res);

  setUser({ id: user.id });
  if (req.method === "GET") {
    const credentialsId = req.query.credentialsId as string | undefined;
    if (!credentialsId) return badRequest(res);
    const auth = await getAuthenticatedGoogleClient(user.id, credentialsId);
    if (!auth)
      return res.status(404).send("Couldn't find credentials in database");
    const response = await drive({
      version: "v3",
      auth: auth.client,
    }).files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: "nextPageToken, files(id, name)",
      pageSize: 300,
    });
    return res.send(response.data);
  }
  return methodNotAllowed(res);
};

export default handler;
