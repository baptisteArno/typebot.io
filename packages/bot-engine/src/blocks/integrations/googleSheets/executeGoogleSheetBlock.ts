import { GoogleSheetsAction } from "@typebot.io/blocks-integrations/googleSheets/constants";
import type { GoogleSheetsBlock } from "@typebot.io/blocks-integrations/googleSheets/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import type { ExecuteIntegrationResponse } from "../../../types";
import { getRow } from "./getRow";
import { insertRow } from "./insertRow";
import { updateRow } from "./updateRow";

export const executeGoogleSheetBlock = async (
  block: GoogleSheetsBlock,
  { sessionStore, state }: { sessionStore: SessionStore; state: SessionState },
): Promise<ExecuteIntegrationResponse> => {
  if (!block.options) return { outgoingEdgeId: block.outgoingEdgeId };
  const action = block.options.action;
  if (!action) return { outgoingEdgeId: block.outgoingEdgeId };
  switch (action) {
    case GoogleSheetsAction.INSERT_ROW:
      return insertRow(block.options, {
        sessionStore,
        state,
        outgoingEdgeId: block.outgoingEdgeId,
      });
    case GoogleSheetsAction.UPDATE_ROW:
      return updateRow(block.options, {
        sessionStore,
        state,
        outgoingEdgeId: block.outgoingEdgeId,
      });
    case GoogleSheetsAction.GET:
      return getRow(block.options, {
        blockId: block.id,
        sessionStore,
        state,
        outgoingEdgeId: block.outgoingEdgeId,
      });
  }
};
