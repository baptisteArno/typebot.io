import type { GoogleSheetsInsertRowOptions } from "@typebot.io/blocks-integrations/googleSheets/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { getGoogleSpreadsheet } from "@typebot.io/credentials/getGoogleSpreadsheet";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import type { LogInSession } from "@typebot.io/logs/schemas";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import type { ExecuteIntegrationResponse } from "../../../types";
import { parseNewRowObject } from "./helpers/parseNewRowObject";

export const insertRow = async (
  options: GoogleSheetsInsertRowOptions,
  {
    outgoingEdgeId,
    state,
    sessionStore,
  }: {
    outgoingEdgeId?: string;
    state: SessionState;
    sessionStore: SessionStore;
  },
): Promise<ExecuteIntegrationResponse> => {
  const { variables } = state.typebotsQueue[0].typebot;
  if (!options.cellsToInsert || !options.sheetId) return { outgoingEdgeId };
  if (!options.credentialsId || !options.spreadsheetId)
    return {
      outgoingEdgeId,
      logs: [
        {
          status: "error",
          description: "Missing credentialsId or spreadsheetId",
        },
      ],
    };

  const logs: LogInSession[] = [];

  const docResponse = await getGoogleSpreadsheet({
    credentialsId: options.credentialsId,
    spreadsheetId: options.spreadsheetId,
    workspaceId: state.workspaceId,
  });

  if (docResponse.type === "error")
    return {
      outgoingEdgeId,
      logs: [docResponse.log],
    };

  const parsedValues = parseNewRowObject(options.cellsToInsert, {
    variables,
    sessionStore,
  });

  try {
    await docResponse.spreadsheet.loadInfo();
    const sheet = docResponse.spreadsheet.sheetsById[Number(options.sheetId)];
    await sheet.addRow(parsedValues);
    logs.push({
      status: "success",
      description: `Succesfully inserted row in ${docResponse.spreadsheet.title} > ${sheet.title}`,
    });
  } catch (err) {
    logs.push(
      await parseUnknownError({
        err,
        context: "While inserting row in spreadsheet",
      }),
    );
  }

  return { outgoingEdgeId, logs };
};
