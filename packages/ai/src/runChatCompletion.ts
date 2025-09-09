import type { LogsStore, VariableStore } from "@typebot.io/forge/types";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { generateText, type LanguageModel } from "ai";
import { maxSteps } from "./constants";
import { parseChatCompletionMessages } from "./parseChatCompletionMessages";
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
  logs: LogsStore;
  responseMapping:
    | {
        item?: string;
        variableId?: string;
      }[]
    | undefined;
  sessionStore: SessionStore;
  headers?: Record<string, string | undefined>;
};

export const runChatCompletion = async ({
  variables,
  messages,
  model,
  isVisionEnabled,
  temperature,
  tools,
  responseMapping,
  logs,
  sessionStore,
  headers,
}: Props) => {
  try {
    const parsedMessages = await parseChatCompletionMessages({
      messages,
      variables,
      isVisionEnabled,
      shouldDownloadImages: false,
    });
    const response = await generateText({
      model,
      temperature,
      messages: parsedMessages,
      tools: parseTools({ tools, variables, sessionStore }),
      maxSteps,
      headers,
    });

    responseMapping?.forEach((mapping) => {
      if (!mapping.variableId) return;
      if (!mapping.item || mapping.item === "Message content")
        variables.set([{ id: mapping.variableId, value: response.text }]);
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
          { id: mapping.variableId, value: response.usage.completionTokens },
        ]);
    });

    return response;
  } catch (err) {
    logs.add(
      await parseUnknownError({
        err,
        context: "While generating chat completion",
      }),
    );
  }
};
