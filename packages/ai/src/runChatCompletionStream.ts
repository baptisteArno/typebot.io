import type { VariableStore } from "@typebot.io/forge/types";
import {
  parseUnknownError,
  parseUnknownErrorSync,
} from "@typebot.io/lib/parseUnknownError";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { type LanguageModel, streamText } from "ai";
import { maxSteps } from "./constants";
import { parseChatCompletionMessages } from "./parseChatCompletionMessages";
import type { ChatCompletionOptions } from "./parseChatCompletionOptions";
import { parseTools } from "./parseTools";
import type { Tools } from "./schemas";
import type { Message } from "./types";

type Props = {
  model: LanguageModel;
  variables: VariableStore;
  messages: Message[];
  tools: Tools | undefined;
  isVisionEnabled: boolean;
  temperature: number | undefined;
  responseMapping: ChatCompletionOptions["responseMapping"] | undefined;
  sessionStore: SessionStore;
};

export const runChatCompletionStream = async ({
  variables,
  messages,
  model,
  isVisionEnabled,
  temperature,
  tools,
  responseMapping,
  sessionStore,
}: Props) => {
  try {
    const response = streamText({
      model,
      messages: await parseChatCompletionMessages({
        messages: messages,
        isVisionEnabled,
        shouldDownloadImages: false,
        variables,
      }),
      temperature,
      tools: parseTools({ tools, variables, sessionStore }),
      maxSteps,
      onFinish: (response) => {
        responseMapping?.forEach((mapping) => {
          if (!mapping.variableId) return;
          if (mapping.item === "Total tokens")
            variables.set([
              { id: mapping.variableId, value: response.usage.totalTokens },
            ]);
          if (mapping.item === "Prompt tokens")
            variables.set([
              { id: mapping.variableId, value: response.usage.promptTokens },
            ]);
          if (mapping.item === "Completion tokens")
            variables.set([
              {
                id: mapping.variableId,
                value: response.usage.completionTokens,
              },
            ]);
        });
      },
    });

    return {
      stream: response.toDataStream({
        getErrorMessage: (err) => {
          return JSON.stringify(
            parseUnknownErrorSync({ err, context: "While streaming AI" }),
          );
        },
        sendUsage: false,
      }),
    };
  } catch (err) {
    return {
      error: await parseUnknownError({
        err,
        context: "While running chat completion stream",
      }),
    };
  }
};
