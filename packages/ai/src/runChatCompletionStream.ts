import type { VariableStore } from "@typebot.io/forge/types";
import {
  parseUnknownError,
  parseUnknownErrorSync,
} from "@typebot.io/lib/parseUnknownError";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { type LanguageModel, type StepResult, type Tool, streamText } from "ai";
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
  responseMapping:
    | {
        item?: string;
        variableId?: string;
      }[]
    | undefined;
  onFinish?: (
    response: Omit<
      StepResult<Record<string, Tool>>,
      "stepType" | "isContinued"
    > & {
      readonly steps: StepResult<Record<string, Tool>>[];
    },
  ) => void;
  sessionStore: SessionStore;
  headers?: Record<string, string | undefined>;
};

export const runChatCompletionStream = async ({
  variables,
  messages,
  model,
  isVisionEnabled,
  temperature,
  tools,
  responseMapping,
  onFinish,
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
    const response = streamText({
      model,
      messages: parsedMessages,
      temperature,
      tools: parseTools({ tools, variables, sessionStore }),
      maxSteps,
      headers,
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
        onFinish?.(response);
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
