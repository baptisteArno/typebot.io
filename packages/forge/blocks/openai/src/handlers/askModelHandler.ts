import { createActionHandler } from "@typebot.io/forge";
import type {
  AsyncVariableStore,
  LogsStore,
  VariableStore,
} from "@typebot.io/forge/types";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { safeStringify } from "@typebot.io/lib/safeStringify";
import { isDefined, isEmpty, isNotEmpty } from "@typebot.io/lib/utils";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { executeFunction } from "@typebot.io/variables/executeFunction";
import { formatDataStreamPart, processDataStream } from "ai";
import type { ClientOptions } from "openai";
import OpenAI from "openai";
import type { ResponseStreamEvent } from "openai/resources/responses/responses";
import { askModel } from "../actions/askModel";
import { maxToolCalls } from "../constants";
import { parseToolsForResponsesApi } from "../helpers/parseToolsForResponsesApi";

export const askModelHandler = createActionHandler(askModel, {
  stream: {
    run: async ({ credentials, options, variables, sessionStore }) => ({
      stream: await createResponseStream({
        apiKey: credentials.apiKey,
        baseUrl: credentials.baseUrl ?? options.baseUrl,
        apiVersion: options.apiVersion,
        model: options.model,
        message: options.message,
        instructions: options.instructions,
        responseIdVariableId: options.responseIdVariableId,
        functions: options.functions,
        fileSearchVectorStoreIds:
          options.fileSearchVectorStoreIds?.filter(isDefined),
        webSearchEnabled: options.webSearchEnabled,
        codeInterpreterEnabled: options.codeInterpreterEnabled,
        temperature: options.temperature,
        responseMapping: options.responseMapping,
        variables,
        sessionStore,
      }),
    }),
  },
  server: async ({
    credentials: { apiKey, baseUrl },
    options,
    variables,
    logs,
    sessionStore,
  }) => {
    const stream = await createResponseStream({
      apiKey,
      baseUrl: baseUrl ?? options.baseUrl,
      apiVersion: options.apiVersion,
      model: options.model,
      message: options.message,
      instructions: options.instructions,
      responseIdVariableId: options.responseIdVariableId,
      functions: options.functions,
      fileSearchVectorStoreIds:
        options.fileSearchVectorStoreIds?.filter(isDefined),
      webSearchEnabled: options.webSearchEnabled,
      codeInterpreterEnabled: options.codeInterpreterEnabled,
      temperature: options.temperature,
      responseMapping: options.responseMapping,
      variables,
      logs,
      sessionStore,
    });

    if (!stream) {
      logs.add("createResponseStream returned undefined");
      return;
    }

    let writingMessage = "";

    await processDataStream({
      stream,
      onTextPart: (text) => {
        writingMessage += text;
      },
      onErrorPart: (error) => {
        logs?.add(error);
      },
    });

    options.responseMapping?.forEach((mapping) => {
      if (!mapping.variableId) return;
      if (!mapping.item || mapping.item === "Message")
        variables.set([{ id: mapping.variableId, value: writingMessage }]);
    });
  },
});

const createResponseStream = async ({
  apiKey,
  baseUrl,
  apiVersion,
  model,
  message,
  instructions,
  responseIdVariableId,
  functions,
  fileSearchVectorStoreIds,
  webSearchEnabled,
  codeInterpreterEnabled,
  temperature,
  responseMapping,
  logs,
  variables,
  sessionStore,
}: {
  apiKey?: string;
  baseUrl?: string;
  apiVersion?: string;
  model?: string;
  message?: string;
  instructions?: string;
  responseIdVariableId?: string;
  functions?: {
    name?: string;
    description?: string;
    parameters?: {
      type?: "string" | "number" | "boolean" | "enum";
      name?: string;
      description?: string;
      required?: boolean;
      values?: (string | undefined)[];
    }[];
    code?: string;
  }[];
  fileSearchVectorStoreIds?: string[];
  webSearchEnabled?: boolean;
  codeInterpreterEnabled?: boolean;
  temperature?: number;
  responseMapping?: {
    item?: "Message" | "Response ID" | undefined;
    variableId?: string | undefined;
  }[];
  logs?: LogsStore;
  variables: AsyncVariableStore | VariableStore;
  sessionStore: SessionStore;
}): Promise<ReadableStream<Uint8Array> | undefined> => {
  if (isEmpty(model)) {
    logs?.add("Model is empty");
    return;
  }
  if (isEmpty(message)) {
    logs?.add("Message is empty");
    return;
  }

  const config = {
    apiKey,
    baseURL: baseUrl,
    defaultHeaders: { "api-key": apiKey },
    defaultQuery: apiVersion ? { "api-version": apiVersion } : undefined,
  } satisfies ClientOptions;

  const openai = new OpenAI(config);

  let previousResponseId: string | undefined;
  if (
    responseIdVariableId &&
    isNotEmpty(variables.get(responseIdVariableId)?.toString())
  )
    previousResponseId = variables.get(responseIdVariableId)?.toString();

  const tools = parseToolsForResponsesApi({
    functions,
    fileSearchVectorStoreIds,
    webSearchEnabled,
    codeInterpreterEnabled,
  });

  const parsedTemperature =
    typeof temperature === "string"
      ? Number.parseFloat(temperature)
      : temperature;

  try {
    return createResponseFoundationalStream(async ({ forwardStream }) => {
      const stream = openai.responses.stream({
        model,
        input: message,
        instructions: instructions || undefined,
        tools: tools.length > 0 ? tools : undefined,
        previous_response_id: previousResponseId,
        store: true,
        temperature:
          parsedTemperature != null && !Number.isNaN(parsedTemperature)
            ? parsedTemperature
            : undefined,
      });

      let { response, functionCalls } = await forwardStream(stream);

      let toolCallCount = 0;
      while (functionCalls.length > 0 && toolCallCount < maxToolCalls) {
        toolCallCount++;

        const functionCallOutputs: OpenAI.Responses.ResponseInputItem.FunctionCallOutput[] =
          await Promise.all(
            functionCalls.map(async (fnCall) => {
              const functionDef = functions?.find(
                (f) => f.name === fnCall.name,
              );
              if (!functionDef?.code)
                return {
                  type: "function_call_output" as const,
                  call_id: fnCall.call_id,
                  output: JSON.stringify({
                    error: `Function "${fnCall.name}" not found`,
                  }),
                };

              const args = JSON.parse(fnCall.arguments);
              const { output, newVariables } = await executeFunction({
                variables: variables.list(),
                body: functionDef.code,
                args,
                sessionStore,
              });

              if (newVariables && newVariables.length > 0)
                await variables.set(newVariables);

              return {
                type: "function_call_output" as const,
                call_id: fnCall.call_id,
                output: safeStringify(output) ?? "",
              };
            }),
          );

        const continuationStream = openai.responses.stream({
          model,
          input: functionCallOutputs,
          previous_response_id: response.id,
          store: true,
          instructions: instructions || undefined,
          tools: tools.length > 0 ? tools : undefined,
          temperature:
            parsedTemperature != null && !Number.isNaN(parsedTemperature)
              ? parsedTemperature
              : undefined,
        });

        ({ response, functionCalls } =
          await forwardStream(continuationStream));
      }

      const responseIdMapping = responseMapping?.find(
        (m) => m.item === "Response ID",
      );
      if (responseIdMapping?.variableId)
        await variables.set([
          { id: responseIdMapping.variableId, value: response.id },
        ]);
      else if (responseIdVariableId)
        await variables.set([
          { id: responseIdVariableId, value: response.id },
        ]);
    });
  } catch (error) {
    logs?.add(await parseUnknownError({ err: error }));
  }
};

const createResponseFoundationalStream = (
  process: (helpers: {
    forwardStream: (stream: {
      [Symbol.asyncIterator](): AsyncIterator<ResponseStreamEvent>;
      finalResponse(): Promise<OpenAI.Responses.Response>;
    }) => Promise<{
      response: OpenAI.Responses.Response;
      functionCalls: OpenAI.Responses.ResponseFunctionToolCall[];
    }>;
  }) => Promise<void>,
) =>
  new ReadableStream<Uint8Array>({
    async start(controller) {
      const textEncoder = new TextEncoder();

      const sendError = (errorMessage: string) => {
        controller.enqueue(
          textEncoder.encode(formatDataStreamPart("error", errorMessage)),
        );
      };

      const forwardStream = async (stream: {
        [Symbol.asyncIterator](): AsyncIterator<ResponseStreamEvent>;
        finalResponse(): Promise<OpenAI.Responses.Response>;
      }) => {
        for await (const event of stream) {
          if (event.type === "response.output_text.delta")
            controller.enqueue(
              textEncoder.encode(formatDataStreamPart("text", event.delta)),
            );
        }

        const response = await stream.finalResponse();
        const functionCalls = response.output.filter(
          (item): item is OpenAI.Responses.ResponseFunctionToolCall =>
            item.type === "function_call",
        );

        return { response, functionCalls };
      };

      try {
        await process({ forwardStream });
      } catch (error) {
        sendError((error as any).message ?? `${error}`);
      } finally {
        controller.close();
      }
    },
    pull() {},
    cancel() {},
  });
