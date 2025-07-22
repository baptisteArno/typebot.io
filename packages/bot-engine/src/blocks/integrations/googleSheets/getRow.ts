import type { GoogleSheetsGetOptions } from "@typebot.io/blocks-integrations/googleSheets/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { getGoogleSpreadsheet } from "@typebot.io/credentials/getGoogleSpreadsheet";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { byId, isDefined, isNotEmpty } from "@typebot.io/lib/utils";
import type { LogInSession } from "@typebot.io/logs/schemas";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { deepParseVariables } from "@typebot.io/variables/deepParseVariables";
import type { VariableWithValue } from "@typebot.io/variables/schemas";
import type { ExecuteIntegrationResponse } from "../../../types";
import { updateVariablesInSession } from "../../../updateVariablesInSession";
import { matchFilter } from "./helpers/matchFilter";

export const getRow = async (
  options: GoogleSheetsGetOptions,
  {
    state,
    sessionStore,
    blockId,
    outgoingEdgeId,
  }: {
    blockId: string;
    outgoingEdgeId?: string;
    state: SessionState;
    sessionStore: SessionStore;
  },
): Promise<ExecuteIntegrationResponse> => {
  const logs: LogInSession[] = [];
  const { variables } = state.typebotsQueue[0].typebot;
  const { sheetId, cellsToExtract, filter, ...parsedOptions } =
    deepParseVariables(options, {
      variables,
      removeEmptyStrings: true,
      sessionStore,
    });
  if (!sheetId) return { outgoingEdgeId };
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

  const doc = await getGoogleSpreadsheet({
    credentialsId: options.credentialsId,
    spreadsheetId: options.spreadsheetId,
    workspaceId: state.workspaceId,
  });

  if (!doc)
    return {
      outgoingEdgeId,
      logs: [
        {
          status: "error",
          description: "Couldn't find credentials in database",
          context: "While getting spreadsheet row",
        },
      ],
    };

  try {
    await doc.loadInfo();
    const sheet = doc.sheetsById[Number(sheetId)];
    const rows = await sheet.getRows();
    const filteredRows = getTotalRows(
      options.totalRowsToExtract,
      rows.filter((row) =>
        "referenceCell" in parsedOptions && parsedOptions.referenceCell
          ? row.get(parsedOptions.referenceCell?.column as string) ===
            parsedOptions.referenceCell?.value
          : matchFilter(row, filter),
      ),
    );
    if (filteredRows.length === 0) {
      logs.push({
        status: "info",
        description: `Couldn't find any rows matching the filter`,
        details: JSON.stringify(filter, null, 2),
      });
      return { outgoingEdgeId, logs };
    }
    const extractingColumns = cellsToExtract
      ?.map((cell) => cell.column)
      .filter(isNotEmpty);
    const selectedRows = filteredRows
      .map((row) =>
        extractingColumns?.reduce<{ [key: string]: string }>(
          (obj, column) => ({ ...obj, [column]: row.get(column) }),
          {},
        ),
      )
      .filter(isDefined);
    if (!selectedRows) return { outgoingEdgeId };

    const newVariables = options.cellsToExtract?.reduce<VariableWithValue[]>(
      (newVariables, cell) => {
        const existingVariable = variables.find(byId(cell.variableId));
        const value = selectedRows.map((row) => row[cell.column ?? ""]);
        if (!existingVariable) return newVariables;
        return [
          ...newVariables,
          {
            ...existingVariable,
            value: value.length === 1 ? value[0] : value,
          },
        ];
      },
      [],
    );
    if (!newVariables) return { outgoingEdgeId };
    const { updatedState, newSetVariableHistory } = updateVariablesInSession({
      state,
      newVariables,
      currentBlockId: blockId,
    });
    return {
      outgoingEdgeId,
      newSessionState: updatedState,
      newSetVariableHistory,
    };
  } catch (err) {
    logs.push(
      await parseUnknownError({
        err,
        context: "While getting spreadsheet row",
      }),
    );
  }
  return { outgoingEdgeId, logs };
};

const getTotalRows = <T>(
  totalRowsToExtract: GoogleSheetsGetOptions["totalRowsToExtract"],
  rows: T[],
): T[] => {
  switch (totalRowsToExtract) {
    case "All":
    case undefined:
      return rows;
    case "First":
      return rows.slice(0, 1);
    case "Last":
      return rows.slice(-1);
    case "Random":
      return [rows[Math.floor(Math.random() * rows.length)]];
  }
};
