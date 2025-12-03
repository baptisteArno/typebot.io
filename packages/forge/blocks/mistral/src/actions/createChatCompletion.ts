import { getChatCompletionStreamVarId } from "@typebot.io/ai/getChatCompletionStreamVarId";
import { parseChatCompletionOptions } from "@typebot.io/ai/parseChatCompletionOptions";
import { createAction } from "@typebot.io/forge";
import { isDefined } from "@typebot.io/lib/utils";
import { auth } from "../auth";
import { models } from "../constants";

export const createChatCompletion = createAction({
  name: "Create chat completion",
  auth,
  options: parseChatCompletionOptions({
    models: {
      type: "static",
      models,
    },
  }),
  turnableInto: [
    {
      blockId: "openai",
      transform: (opts) => ({
        ...opts,
        model: undefined,
      }),
    },
    {
      blockId: "groq",
      transform: (opts) => ({
        ...opts,
        model: undefined,
      }),
    },
    {
      blockId: "together-ai",
    },
    { blockId: "open-router" },
    {
      blockId: "anthropic",
      transform: (options) => ({
        ...options,
        model: undefined,
        action: "Create Chat Message",
      }),
    },
    {
      blockId: "perplexity",
      transform: (options) => ({
        ...options,
        model: undefined,
      }),
    },
    {
      blockId: "deepseek",
      transform: (options) => ({
        ...options,
        model: undefined,
      }),
    },
  ],
  getSetVariableIds: (options) =>
    options.responseMapping?.map((res) => res.variableId).filter(isDefined) ??
    [],
  getStreamVariableId: getChatCompletionStreamVarId,
});
