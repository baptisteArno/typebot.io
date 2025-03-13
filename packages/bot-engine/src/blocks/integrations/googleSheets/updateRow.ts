import type { GoogleSheetsUpdateRowOptions } from "@typebot.io/blocks-integrations/googleSheets/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import type { LogInSession } from "@typebot.io/logs/schemas";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { deepParseVariables } from "@typebot.io/variables/deepParseVariables";
import type { ExecuteIntegrationResponse } from "../../../types";
import { getAuthenticatedGoogleDoc } from "./helpers/getAuthenticatedGoogleDoc";
import { matchFilter } from "./helpers/matchFilter";
import { parseNewCellValuesObject } from "./helpers/parseNewCellValuesObject";

export const updateRow = async (
  options: GoogleSheetsUpdateRowOptions,
  {
    state,
    outgoingEdgeId,
    sessionStore,
  }: {
    outgoingEdgeId?: string;
    state: SessionState;
    sessionStore: SessionStore;
  },
): Promise<ExecuteIntegrationResponse> => {
  const { variables } = state.typebotsQueue[0].typebot;
  const { sheetId, filter, ...parsedOptions } = deepParseVariables(options, {
    variables,
    removeEmptyStrings: true,
    sessionStore,
  });
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

  const referenceCell =
    "referenceCell" in parsedOptions && parsedOptions.referenceCell
      ? parsedOptions.referenceCell
      : null;

  if (!options.cellsToUpsert || !sheetId || (!referenceCell && !filter))
    return { outgoingEdgeId };

  const logs: LogInSession[] = [];

  const doc = await getAuthenticatedGoogleDoc({
    credentialsId: options.credentialsId,
    spreadsheetId: options.spreadsheetId,
    workspaceId: state.workspaceId,
  });

  try {
    await doc.loadInfo();
    const sheet = doc.sheetsById[Number(sheetId)];
    const rows = await sheet.getRows();
    const filteredRows = rows.filter((row) =>
      referenceCell
        ? row.get(referenceCell.column as string) === referenceCell.value
        : matchFilter(row, filter as NonNullable<typeof filter>),
    );
    if (filteredRows.length === 0) {
      logs.push({
        status: "info",
        description: `Could not find any row that matches the filter`,
        details: JSON.stringify(filter),
      });
      return { outgoingEdgeId, logs };
    }

    const parsedValues = parseNewCellValuesObject(options.cellsToUpsert, {
      variables,
      sessionStore,
      headerValues: sheet.headerValues,
    });

    for (const filteredRow of filteredRows) {
      const cellsRange = filteredRow.a1Range.split("!").pop();
      await sheet.loadCells(cellsRange);
      const rowIndex = filteredRow.rowNumber - 1;
      for (const key in parsedValues) {
        const cellToUpdate = sheet.getCell(
          rowIndex,
          parsedValues[key].columnIndex,
        );
        cellToUpdate.value = parsedValues[key].value;
      }
      await sheet.saveUpdatedCells();
    }

    logs.push({
      status: "success",
      description: `Succesfully updated matching rows`,
    });
  } catch (err) {
    logs.push(
      await parseUnknownError({
        err,
        context: "While updating row in spreadsheet",
      }),
    );
  }
  return { outgoingEdgeId, logs };
};
