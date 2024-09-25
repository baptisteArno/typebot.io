import { parseVariables } from "@/features/variables";
import type { LogicState } from "@/types";
import type { WaitBlock } from "@typebot.io/blocks-logic/wait/schema";

export const executeWait = async (
  block: WaitBlock,
  { typebot: { variables } }: LogicState,
) => {
  if (!block.options?.secondsToWaitFor) return block.outgoingEdgeId;
  const parsedSecondsToWaitFor = parseVariables(variables)(
    block.options.secondsToWaitFor,
  );
  // @ts-expect-error isNaN can be used with strings
  if (isNaN(parsedSecondsToWaitFor)) return block.outgoingEdgeId;
  await new Promise((resolve) =>
    setTimeout(resolve, Number.parseInt(parsedSecondsToWaitFor) * 1000),
  );
  return block.outgoingEdgeId;
};
