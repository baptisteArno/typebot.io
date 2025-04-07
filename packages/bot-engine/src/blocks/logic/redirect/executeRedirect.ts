import type { RedirectBlock } from "@typebot.io/blocks-logic/redirect/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { sanitizeUrl } from "@typebot.io/lib/utils";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { ExecuteLogicResponse } from "../../../types";

export const executeRedirect = (
  block: RedirectBlock,
  { state, sessionStore }: { state: SessionState; sessionStore: SessionStore },
): ExecuteLogicResponse => {
  const { variables } = state.typebotsQueue[0].typebot;
  if (!block.options?.url) return { outgoingEdgeId: block.outgoingEdgeId };
  const formattedUrl = sanitizeUrl(
    parseVariables(block.options.url, {
      variables,
      sessionStore,
    }),
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
