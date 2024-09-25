import { createOpenAI } from "@ai-sdk/openai";
import { appendToolResultsToMessages } from "@typebot.io/ai/appendToolResultsToMessages";
import { parseChatCompletionMessages } from "@typebot.io/ai/parseChatCompletionMessages";
import { parseTools } from "@typebot.io/ai/parseTools";
import { pumpStreamUntilDone } from "@typebot.io/ai/pumpStreamUntilDone";
import type { AsyncVariableStore } from "@typebot.io/forge/types";
import {
  APICallError,
  type ToolCallPart,
  type ToolResultPart,
  streamText,
} from "ai";
import { maxToolCalls } from "../constants";
import { isModelCompatibleWithVision } from "../helpers/isModelCompatibleWithVision";
import type { ChatCompletionOptions } from "./parseChatCompletionOptions";

type Props = {
  credentials: { apiKey?: string };
  options: ChatCompletionOptions;
  variables: AsyncVariableStore;
  config: { baseUrl?: string; defaultModel?: string };
  compatibility?: "strict" | "compatible";
};

export const runOpenAIChatCompletionStream = async ({
  credentials: { apiKey },
  options,
  variables,
  config: openAIConfig,
  compatibility,
}: Props): Promise<{
  stream?: ReadableStream<any>;
  httpError?: { status: number; message: string };
}> => {
  if (!apiKey)
    return { httpError: { status: 401, message: "API key missing" } };
  const modelName = options.model?.trim() ?? openAIConfig.defaultModel;
  if (!modelName)
    return { httpError: { status: 400, message: "model not found" } };

  const model = createOpenAI({
    baseURL: openAIConfig.baseUrl ?? options.baseUrl,
    apiKey,
    compatibility,
  })(modelName);

  const streamConfig = {
    model,
    messages: await parseChatCompletionMessages({
      messages: options.messages,
      isVisionEnabled: isModelCompatibleWithVision(modelName),
      shouldDownloadImages: false,
      variables,
    }),
    temperature: options.temperature ? Number(options.temperature) : undefined,
    tools: parseTools({ tools: options.tools, variables }),
  };

  try {
    const response = await streamText(streamConfig);

    let totalToolCalls = 0;
    let totalTokens = 0;
    let toolCalls: ToolCallPart[] = [];
    let toolResults: ToolResultPart[] = [];

    return {
      stream: new ReadableStream({
        async start(controller) {
          const reader = response.toAIStream().getReader();

          await pumpStreamUntilDone(controller, reader);

          totalTokens = (await response.usage).totalTokens;

          toolCalls = await response.toolCalls;
          if (toolCalls.length > 0)
            toolResults = (await response.toolResults) as ToolResultPart[];

          while (
            toolCalls &&
            toolCalls.length > 0 &&
            totalToolCalls < maxToolCalls
          ) {
            totalToolCalls += 1;
            const newResponse = await streamText({
              ...streamConfig,
              messages: appendToolResultsToMessages({
                messages: streamConfig.messages,
                toolCalls,
                toolResults,
              }),
            });
            const reader = newResponse.toAIStream().getReader();
            await pumpStreamUntilDone(controller, reader);
            totalTokens += (await newResponse.usage).totalTokens;
            toolCalls = await newResponse.toolCalls;
            if (toolCalls.length > 0)
              toolResults = (await newResponse.toolResults) as ToolResultPart[];
          }

          const totalTokenVariableId = options.responseMapping?.find(
            (mapping) => mapping.item === "Total tokens",
          )?.variableId;

          if (totalTokenVariableId)
            await variables.set(totalTokenVariableId, totalTokens);

          controller.close();
        },
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
