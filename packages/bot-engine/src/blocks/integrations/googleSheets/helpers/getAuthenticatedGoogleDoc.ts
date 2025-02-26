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
  // TO-DO: Remove workspaceId optionality once v3.4 is out
  workspaceId?: string;
}) => {
  const client = await getAuthenticatedGoogleClient(credentialsId, workspaceId);
  if (!client)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Couldn't find credentials in database",
    });
  return new GoogleSpreadsheet(spreadsheetId, client);
};
