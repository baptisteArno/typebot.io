import type { VariableStore } from "@typebot.io/forge/types";
import { APICallError, type LanguageModel, streamText } from "ai";
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
};

export const runChatCompletionStream = async ({
  variables,
  messages,
  model,
  isVisionEnabled,
  temperature,
  tools,
  responseMapping,
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
      tools: parseTools({ tools, variables }),
      maxSteps,
      onFinish: (response) => {
        responseMapping?.forEach((mapping) => {
          if (!mapping.variableId) return;
          if (mapping.item === "Total tokens")
            variables.set([
              { id: mapping.variableId, value: response.usage.totalTokens },
            ]);
        });
      },
    });

    return {
      stream: response.toDataStream({
        sendUsage: false,
      }),
    };
  } catch (err) {
    if (err instanceof APICallError) {
      return {
        httpError: { status: err.statusCode ?? 500, message: err.message },
      };
    }
    return {
      httpError: {
        status: 500,
        message: "An unknown error occured while generating the response",
      },
    };
  }
};
