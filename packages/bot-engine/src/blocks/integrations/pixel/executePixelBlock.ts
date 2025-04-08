import type { PixelBlock } from "@typebot.io/blocks-integrations/pixel/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { deepParseVariables } from "@typebot.io/variables/deepParseVariables";
import type { ExecuteIntegrationResponse } from "../../../types";

export const executePixelBlock = (
  block: PixelBlock,
  { state, sessionStore }: { state: SessionState; sessionStore: SessionStore },
): ExecuteIntegrationResponse => {
  const { typebot, resultId } = state.typebotsQueue[0];
  if (
    !resultId ||
    !block.options?.pixelId ||
    !block.options.eventType ||
    state.whatsApp
  )
    return { outgoingEdgeId: block.outgoingEdgeId };
  const pixel = deepParseVariables(block.options, {
    variables: typebot.variables,
    sessionStore,
    guessCorrectTypes: true,
    removeEmptyStrings: true,
  });
  return {
    outgoingEdgeId: block.outgoingEdgeId,
    clientSideActions: [
      {
        type: "pixel",
        pixel: {
          ...pixel,
          pixelId: block.options.pixelId,
        },
      },
    ],
  };
};
