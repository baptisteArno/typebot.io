import type { ConditionBlock } from "@typebot.io/blocks-logic/condition/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { executeCondition } from "@typebot.io/conditions/executeCondition";
import type { ExecuteLogicResponse } from "../../../types";

export const executeConditionBlock = (
  state: SessionState,
  block: ConditionBlock,
): ExecuteLogicResponse => {
  const { variables } = state.typebotsQueue[0].typebot;
  const passedCondition = block.items.find(
    (item) =>
      item.content && executeCondition({ variables, condition: item.content }),
  );
  return {
    outgoingEdgeId: passedCondition
      ? passedCondition.outgoingEdgeId
      : block.outgoingEdgeId,
  };
};
