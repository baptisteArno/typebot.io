import type { OpenAIBlock } from "@typebot.io/blocks-integrations/openai/schema";
import type { SessionState } from "../../../../schemas/chatSession";
import type { ExecuteIntegrationResponse } from "../../../../types";
import { createSpeechOpenAI } from "./audio/createSpeechOpenAI";
import { createChatCompletionOpenAI } from "./createChatCompletionOpenAI";

export const executeOpenAIBlock = async (
  state: SessionState,
  block: OpenAIBlock,
): Promise<ExecuteIntegrationResponse> => {
  switch (block.options?.task) {
    case "Create chat completion":
      return createChatCompletionOpenAI(state, {
        options: block.options,
        outgoingEdgeId: block.outgoingEdgeId,
        blockId: block.id,
      });
    case "Create speech":
      return createSpeechOpenAI(state, {
        options: block.options,
        outgoingEdgeId: block.outgoingEdgeId,
      });
    case "Create image":
    case undefined:
      return { outgoingEdgeId: block.outgoingEdgeId };
  }
};
