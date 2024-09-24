import type { WaitBlock } from "@typebot.io/blocks-logic/wait/schema";
import { isNotDefined } from "@typebot.io/lib/utils";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { SessionState } from "../../../schemas/chatSession";
import type { ExecuteLogicResponse } from "../../../types";

export const executeWait = (
  state: SessionState,
  block: WaitBlock,
): ExecuteLogicResponse => {
  const { variables } = state.typebotsQueue[0].typebot;
  if (!block.options?.secondsToWaitFor)
    return { outgoingEdgeId: block.outgoingEdgeId };

  const parsedSecondsToWaitFor = safeParseFloat(
    parseVariables(variables)(block.options.secondsToWaitFor),
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

const safeParseFloat = (value: string) => {
  const parsedValue = Number.parseFloat(value);
  return isNaN(parsedValue) ? undefined : parsedValue;
};
