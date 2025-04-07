import type { GoogleAnalyticsBlock } from "@typebot.io/blocks-integrations/googleAnalytics/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { deepParseVariables } from "@typebot.io/variables/deepParseVariables";
import type { ExecuteIntegrationResponse } from "../../../../types";

export const executeGoogleAnalyticsBlock = (
  block: GoogleAnalyticsBlock,
  { state, sessionStore }: { state: SessionState; sessionStore: SessionStore },
): ExecuteIntegrationResponse => {
  const { typebot, resultId } = state.typebotsQueue[0];
  if (!resultId || state.whatsApp || !block.options)
    return { outgoingEdgeId: block.outgoingEdgeId };
  return {
    outgoingEdgeId: block.outgoingEdgeId,
    clientSideActions: [
      {
        type: "googleAnalytics",
        googleAnalytics: deepParseVariables(block.options, {
          variables: typebot.variables,
          sessionStore,
          guessCorrectTypes: true,
          removeEmptyStrings: true,
        }),
      },
    ],
  };
};
