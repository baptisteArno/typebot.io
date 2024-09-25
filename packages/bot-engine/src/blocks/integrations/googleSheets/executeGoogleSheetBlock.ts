import { GoogleSheetsAction } from "@typebot.io/blocks-integrations/googleSheets/constants";
import type { GoogleSheetsBlock } from "@typebot.io/blocks-integrations/googleSheets/schema";
import type { SessionState } from "../../../schemas/chatSession";
import type { ExecuteIntegrationResponse } from "../../../types";
import { getRow } from "./getRow";
import { insertRow } from "./insertRow";
import { updateRow } from "./updateRow";

export const executeGoogleSheetBlock = async (
  state: SessionState,
  block: GoogleSheetsBlock,
): Promise<ExecuteIntegrationResponse> => {
  if (!block.options) return { outgoingEdgeId: block.outgoingEdgeId };
  const action = block.options.action;
  if (!action) return { outgoingEdgeId: block.outgoingEdgeId };
  switch (action) {
    case GoogleSheetsAction.INSERT_ROW:
      return insertRow(state, {
        options: block.options,
        outgoingEdgeId: block.outgoingEdgeId,
      });
    case GoogleSheetsAction.UPDATE_ROW:
      return updateRow(state, {
        options: block.options,
        outgoingEdgeId: block.outgoingEdgeId,
      });
    case GoogleSheetsAction.GET:
      return getRow(state, {
        blockId: block.id,
        options: block.options,
        outgoingEdgeId: block.outgoingEdgeId,
      });
  }
};
