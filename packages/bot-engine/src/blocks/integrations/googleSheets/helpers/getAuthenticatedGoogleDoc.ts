import { TRPCError } from "@trpc/server";
import { getAuthenticatedGoogleClient } from "@typebot.io/credentials/getAuthenticatedGoogleClient";
import { GoogleSpreadsheet } from "google-spreadsheet";

export const getAuthenticatedGoogleDoc = async ({
  credentialsId,
  spreadsheetId,
}: {
  credentialsId?: string;
  spreadsheetId?: string;
}) => {
  if (!credentialsId || !spreadsheetId)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Missing credentialsId or spreadsheetId",
    });
  const client = await getAuthenticatedGoogleClient(credentialsId);
  if (!client)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Couldn't find credentials in database",
    });
  return new GoogleSpreadsheet(spreadsheetId, client);
};
