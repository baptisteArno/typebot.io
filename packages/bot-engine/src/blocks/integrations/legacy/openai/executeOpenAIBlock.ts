import type { OpenAIBlock } from "@typebot.io/blocks-integrations/openai/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import type { ExecuteIntegrationResponse } from "../../../../types";
import { createSpeechOpenAI } from "./audio/createSpeechOpenAI";
import { createChatCompletionOpenAI } from "./createChatCompletionOpenAI";

export const executeOpenAIBlock = async (
  state: SessionState,
  block: OpenAIBlock,
  sessionStore: SessionStore,
): Promise<ExecuteIntegrationResponse> => {
  switch (block.options?.task) {
    case "Create chat completion":
      return createChatCompletionOpenAI(state, {
        options: block.options,
        outgoingEdgeId: block.outgoingEdgeId,
        blockId: block.id,
        sessionStore,
      });
    case "Create speech":
      return createSpeechOpenAI(block.options, {
        state,
        outgoingEdgeId: block.outgoingEdgeId,
        sessionStore,
      });
    case "Create image":
    case undefined:
      return { outgoingEdgeId: block.outgoingEdgeId };
  }
};
