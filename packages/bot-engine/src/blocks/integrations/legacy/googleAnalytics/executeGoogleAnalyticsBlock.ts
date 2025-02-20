import type { GoogleAnalyticsBlock } from "@typebot.io/blocks-integrations/googleAnalytics/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { deepParseVariables } from "@typebot.io/variables/deepParseVariables";
import type { ExecuteIntegrationResponse } from "../../../../types";

export const executeGoogleAnalyticsBlock = (
  state: SessionState,
  block: GoogleAnalyticsBlock,
): ExecuteIntegrationResponse => {
  const { typebot, resultId } = state.typebotsQueue[0];
  if (!resultId || state.whatsApp || !block.options)
    return { outgoingEdgeId: block.outgoingEdgeId };
  return {
    outgoingEdgeId: block.outgoingEdgeId,
    clientSideActions: [
      {
        type: "googleAnalytics",
        googleAnalytics: deepParseVariables(typebot.variables, {
          guessCorrectTypes: true,
          removeEmptyStrings: true,
        })(block.options),
      },
    ],
  };
};
