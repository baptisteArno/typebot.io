import { TRPCError } from "@trpc/server";
import { getAuthenticatedGoogleClient } from "@typebot.io/credentials/getAuthenticatedGoogleClient";
import { GoogleSpreadsheet } from "google-spreadsheet";

export const getAuthenticatedGoogleDoc = async ({
  credentialsId,
  spreadsheetId,
  workspaceId,
}: {
  credentialsId: string;
  spreadsheetId: string;
  workspaceId: string;
}) => {
  const client = await getAuthenticatedGoogleClient(credentialsId, workspaceId);
  if (!client)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Couldn't find credentials in database",
    });

  const accessToken = client.credentials.access_token;
  if (!accessToken)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No access token found in credentials",
    });

  return new GoogleSpreadsheet(spreadsheetId, {
    token: accessToken,
  });
};
