import { createId } from "@paralleldrive/cuid2";
import {
  MAX_ITERATIONS,
  defaultLoopOptions,
} from "@typebot.io/blocks-logic/loop/constants";
import type { LoopBlock } from "@typebot.io/blocks-logic/loop/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { addVirtualEdge } from "../../../addPortalEdge";
import type { ExecuteLogicResponse } from "../../../types";

export class LoopGuardrailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LoopGuardrailError";
  }
}

export const executeLoopBlock = (
  block: LoopBlock,
  { state, sessionStore }: { state: SessionState; sessionStore: SessionStore },
): ExecuteLogicResponse => {
  const loopOptions = block.options ?? defaultLoopOptions;
  const { loopConfiguration, currentBlockId } = state;

  // Get the loop index and total iterations
  const existingConfiguration = loopConfiguration?.[block.id];
  const loopIndex = existingConfiguration?.index ?? 0;
  const totalIterations =
    loopOptions.iterations ?? defaultLoopOptions.iterations;

  // Check if we've exceeded the maximum iterations guard rail
  if (totalIterations > MAX_ITERATIONS) {
    return {
      outgoingEdgeId: null,
      logs: [
        {
          status: "error",
          description: `Loop iterations (${totalIterations}) exceeds maximum allowed (${MAX_ITERATIONS})`,
        },
      ],
    };
  }

  // Store the loop index in a variable if this is the first iteration
  if (!existingConfiguration) {
    sessionStore.setVariable("loopIndex", 0);
  } else {
    sessionStore.setVariable("loopIndex", loopIndex);
  }

  // Check if we've completed all iterations
  if (loopIndex >= totalIterations) {
    // Reset loop configuration for this block
    const { [block.id]: _, ...restLoopConfig } = state.loopConfiguration ?? {};
    const newState: SessionState = {
      ...state,
      loopConfiguration: restLoopConfig,
    };

    // Exit the loop
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      newSessionState: newState,
    };
  } // Create a virtual edge to create a loop

  // Find the group ID of the current block
  const currentGroup = state.typebotsQueue[0].typebot.groups.find((group) =>
    group.blocks.some((b) => b.id === currentBlockId),
  );

  const groupId = currentGroup?.id ?? block.id;

  const { edgeId, newSessionState } = addVirtualEdge(state, {
    to: { groupId, blockId: currentBlockId ?? block.id },
  });

  // Increment the loop index for the next iteration
  const updatedSessionState: SessionState = {
    ...newSessionState,
    loopConfiguration: {
      ...newSessionState.loopConfiguration,
      [block.id]: {
        index: loopIndex + 1,
      },
    },
  };

  // Continue the loop
  return {
    outgoingEdgeId: edgeId,
    newSessionState: updatedSessionState,
  };
};
