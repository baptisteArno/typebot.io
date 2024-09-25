import type { RedirectBlock } from "@typebot.io/blocks-logic/redirect/schema";
import { sanitizeUrl } from "@typebot.io/lib/utils";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { SessionState } from "../../../schemas/chatSession";
import type { ExecuteLogicResponse } from "../../../types";

export const executeRedirect = (
  state: SessionState,
  block: RedirectBlock,
): ExecuteLogicResponse => {
  const { variables } = state.typebotsQueue[0].typebot;
  if (!block.options?.url) return { outgoingEdgeId: block.outgoingEdgeId };
  const formattedUrl = sanitizeUrl(
    parseVariables(variables)(block.options.url),
  );
  return {
    clientSideActions: [
      {
        type: "redirect",
        redirect: { url: formattedUrl, isNewTab: block.options.isNewTab },
      },
    ],
    outgoingEdgeId: block.outgoingEdgeId,
  };
};
