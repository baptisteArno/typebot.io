import type { ConditionBlock } from "@typebot.io/blocks-logic/condition/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { executeCondition } from "@typebot.io/conditions/executeCondition";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import type { ExecuteLogicResponse } from "../../../types";

export const executeConditionBlock = (
  block: ConditionBlock,
  { state, sessionStore }: { state: SessionState; sessionStore: SessionStore },
): ExecuteLogicResponse => {
  const { variables } = state.typebotsQueue[0].typebot;
  const passedCondition = block.items.find(
    (item) =>
      item.content &&
      executeCondition(item.content, { variables, sessionStore }),
  );
  return {
    outgoingEdgeId: passedCondition
      ? passedCondition.outgoingEdgeId
      : block.outgoingEdgeId,
  };
};
