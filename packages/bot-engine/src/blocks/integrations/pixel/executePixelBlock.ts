import type { PixelBlock } from "@typebot.io/blocks-integrations/pixel/schema";
import { deepParseVariables } from "@typebot.io/variables/deepParseVariables";
import type { SessionState } from "../../../schemas/chatSession";
import type { ExecuteIntegrationResponse } from "../../../types";

export const executePixelBlock = (
  state: SessionState,
  block: PixelBlock,
): ExecuteIntegrationResponse => {
  const { typebot, resultId } = state.typebotsQueue[0];
  if (
    !resultId ||
    !block.options?.pixelId ||
    !block.options.eventType ||
    state.whatsApp
  )
    return { outgoingEdgeId: block.outgoingEdgeId };
  const pixel = deepParseVariables(typebot.variables, {
    guessCorrectTypes: true,
    removeEmptyStrings: true,
  })(block.options);
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
