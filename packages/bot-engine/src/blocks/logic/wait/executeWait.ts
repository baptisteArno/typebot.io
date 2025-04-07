import type { WaitBlock } from "@typebot.io/blocks-logic/wait/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { safeParseFloat } from "@typebot.io/lib/safeParseFloat";
import { isNotDefined } from "@typebot.io/lib/utils";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { ExecuteLogicResponse } from "../../../types";

export const executeWait = (
  block: WaitBlock,
  { sessionStore, state }: { sessionStore: SessionStore; state: SessionState },
): ExecuteLogicResponse => {
  const { variables } = state.typebotsQueue[0].typebot;
  if (!block.options?.secondsToWaitFor)
    return { outgoingEdgeId: block.outgoingEdgeId };

  const parsedSecondsToWaitFor = safeParseFloat(
    parseVariables(block.options.secondsToWaitFor, {
      variables,
      sessionStore,
    }),
  );

  if (isNotDefined(parsedSecondsToWaitFor))
    return { outgoingEdgeId: block.outgoingEdgeId };

  return {
    outgoingEdgeId: block.outgoingEdgeId,
    clientSideActions:
      parsedSecondsToWaitFor || block.options?.shouldPause
        ? [
            {
              type: "wait",
              wait: { secondsToWaitFor: parsedSecondsToWaitFor ?? 0 },
              expectsDedicatedReply: block.options.shouldPause,
            },
          ]
        : undefined,
  };
};
