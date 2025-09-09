import { formatDataStreamPart, processDataStream } from "@ai-sdk/ui-utils";
import { createAction, option } from "@typebot.io/forge";
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
import { type ClientOptions, OpenAI } from "openai";
import { auth } from "../auth";
import { baseOptions } from "../baseOptions";
import { deprecatedAskAssistantOptions } from "../deprecated";
import { isModelCompatibleWithVision } from "../helpers/isModelCompatibleWithVision";
import { splitUserTextMessageIntoOpenAIBlocks } from "../helpers/splitUserTextMessageIntoOpenAIBlocks";

export const askAssistant = createAction({
  auth,
  baseOptions,
  name: "Ask Assistant",
  options: option
    .object({
      assistantId: option.string.layout({
        label: "Assistant ID",
        placeholder: "Select an assistant",
        moreInfoTooltip: "The OpenAI assistant you want to ask question to.",
        fetcher: "fetchAssistants",
      }),
      threadVariableId: option.string.layout({
        label: "Thread ID",
        moreInfoTooltip:
          "Used to remember the conversation with the user. If empty, a new thread is created.",
        inputType: "variableDropdown",
      }),

      message: option.string.layout({
        label: "Message",
        inputType: "textarea",
      }),
      functions: option
        .array(
          option.object({
            name: option.string.layout({
              fetcher: "fetchAssistantFunctions",
              label: "Name",
            }),
            code: option.string.layout({
              inputType: "code",
              label: "Code",
              lang: "javascript",
              moreInfoTooltip:
                "A javascript code snippet that can use the defined parameters. It should return a value.",
              withVariableButton: false,
            }),
          }),
        )
        .layout({ accordion: "Functions", itemLabel: "function" }),
      additionalInstructions: option.string.layout({
        label: "Additional Instructions",
        inputType: "textarea",
        accordion: "Advanced settings",
      }),
      responseMapping: option
        .saveResponseArray(["Message", "Thread ID"] as const, {
          item: { hiddenItems: ["Thread ID"] },
        })
        .layout({
          accordion: "Save response",
        }),
    })
    .merge(deprecatedAskAssistantOptions),
  fetchers: [
    {
      id: "fetchAssistants",
      fetch: async ({ options, credentials }) => {
        if (!credentials?.apiKey)
          return {
            data: [],
          };

        const config = {
          apiKey: credentials.apiKey,
          baseURL: credentials.baseUrl ?? options.baseUrl,
          defaultHeaders: {
            "api-key": credentials.apiKey,
          },
          defaultQuery: options.apiVersion
            ? {
                "api-version": options.apiVersion,
              }
            : undefined,
        } satisfies ClientOptions;

        const openai = new OpenAI(config);

        try {
          const response = await openai.beta.assistants.list({
            limit: 100,
          });

          return {
            data: response.data
              .map((assistant) =>
                assistant.name
                  ? {
                      label: assistant.name,
                      value: assistant.id,
                    }
                  : undefined,
              )
              .filter(isDefined),
          };
        } catch (err) {
          return {
            error: await parseUnknownError({ err }),
          };
        }
      },
      dependencies: ["baseUrl", "apiVersion"],
    },
    {
      id: "fetchAssistantFunctions",
      fetch: async ({ options, credentials }) => {
        if (!options.assistantId || !credentials?.apiKey)
          return {
            data: [],
          };

        const config = {
          apiKey: credentials.apiKey,
          baseURL: credentials.baseUrl ?? options.baseUrl,
          defaultHeaders: {
            "api-key": credentials.apiKey,
          },
          defaultQuery: options.apiVersion
            ? {
                "api-version": options.apiVersion,
              }
            : undefined,
        } satisfies ClientOptions;

        const openai = new OpenAI(config);

        try {
          const response = await openai.beta.assistants.retrieve(
            options.assistantId,
          );

          return {
            data: response.tools
              .filter((tool) => tool.type === "function")
              .map((tool) =>
                tool.type === "function" && tool.function.name
                  ? tool.function.name
                  : undefined,
              )
              .filter(isDefined),
          };
        } catch (err) {
          return {
            error: await parseUnknownError({ err }),
          };
        }
      },
      dependencies: ["baseUrl", "apiVersion", "assistantId"],
    },
  ],
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping?.map((r) => r.variableId).filter(isDefined) ?? [],
  run: {
    stream: {
      getStreamVariableId: ({ responseMapping }) =>
        responseMapping?.find((m) => !m.item || m.item === "Message")
          ?.variableId,
      run: async ({ credentials, options, variables, sessionStore }) => ({
        stream: await createAssistantStream({
          apiKey: credentials.apiKey,
          assistantId: options.assistantId,
          message: options.message,
          baseUrl: credentials.baseUrl ?? options.baseUrl,
          apiVersion: options.apiVersion,
          threadVariableId: options.threadVariableId,
          variables,
          functions: options.functions,
          responseMapping: options.responseMapping,
          additionalInstructions: options.additionalInstructions,
          sessionStore,
        }),
      }),
    },
    server: async ({
      credentials: { apiKey },
      options: {
        baseUrl,
        apiVersion,
        assistantId,
        message,
        responseMapping,
        threadId,
        threadVariableId,
        functions,
        additionalInstructions,
      },
      variables,
      logs,
      sessionStore,
    }) => {
      const stream = await createAssistantStream({
        apiKey,
        assistantId,
        logs,
        message,
        baseUrl,
        apiVersion,
        threadVariableId,
        variables,
        threadId,
        functions,
        additionalInstructions,
        sessionStore,
      });

      if (!stream) {
        logs.add("createAssistantStream returned undefined");
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

      responseMapping?.forEach((mapping) => {
        if (!mapping.variableId) return;
        if (!mapping.item || mapping.item === "Message") {
          variables.set([
            {
              id: mapping.variableId,
              value: writingMessage.replace(/【.+】/g, ""),
            },
          ]);
        }
      });
    },
  },
});

const createAssistantStream = async ({
  apiKey,
  assistantId,
  logs,
  message,
  baseUrl,
  apiVersion,
  threadVariableId,
  variables,
  threadId,
  functions,
  responseMapping,
  additionalInstructions,
  sessionStore,
}: {
  apiKey?: string;
  assistantId?: string;
  message?: string;
  baseUrl?: string;
  apiVersion?: string;
  threadVariableId?: string;
  threadId?: string;
  functions?: { name?: string; code?: string }[];
  additionalInstructions?: string;
  responseMapping?: {
    item?: "Thread ID" | "Message" | undefined;
    variableId?: string | undefined;
  }[];
  logs?: LogsStore;
  variables: AsyncVariableStore | VariableStore;
  sessionStore: SessionStore;
}): Promise<ReadableStream<any> | undefined> => {
  if (isEmpty(assistantId)) {
    logs?.add("Assistant ID is empty");
    return;
  }
  if (isEmpty(message)) {
    logs?.add("Message is empty");
    return;
  }
  const config = {
    apiKey,
    baseURL: baseUrl,
    defaultHeaders: {
      "api-key": apiKey,
    },
    defaultQuery: apiVersion
      ? {
          "api-version": apiVersion,
        }
      : undefined,
  } satisfies ClientOptions;

  const openai = new OpenAI(config);

  let currentThreadId: string | undefined;

  if (
    threadVariableId &&
    isNotEmpty(variables.get(threadVariableId)?.toString())
  ) {
    currentThreadId = variables.get(threadVariableId)?.toString();
  } else if (isNotEmpty(threadId)) {
    currentThreadId = threadId;
  } else {
    currentThreadId = (await openai.beta.threads.create({})).id;
    const threadIdResponseMapping = responseMapping?.find(
      (mapping) => mapping.item === "Thread ID",
    );
    if (threadIdResponseMapping?.variableId)
      await variables.set([
        { id: threadIdResponseMapping.variableId, value: currentThreadId },
      ]);
    else if (threadVariableId)
      await variables.set([{ id: threadVariableId, value: currentThreadId }]);
  }

  if (!currentThreadId) {
    logs?.add("Could not get thread ID");
    return;
  }

  try {
    const assistant = await openai.beta.assistants.retrieve(assistantId);

    await openai.beta.threads.messages.create(currentThreadId, {
      role: "user",
      content: isModelCompatibleWithVision(assistant.model)
        ? await splitUserTextMessageIntoOpenAIBlocks(message)
        : message,
    });

    return createAssistantFoundationalStream(async ({ forwardStream }) => {
      if (!currentThreadId) return;
      const runStream = openai.beta.threads.runs.stream(currentThreadId, {
        assistant_id: assistantId,
        additional_instructions: additionalInstructions,
      });

      let runResult = await forwardStream(runStream);

      while (
        runResult?.status === "requires_action" &&
        runResult.required_action?.type === "submit_tool_outputs"
      ) {
        const tool_outputs = (
          await Promise.all(
            runResult.required_action.submit_tool_outputs.tool_calls.map(
              async (toolCall: any) => {
                const parameters = JSON.parse(toolCall.function.arguments);

                const functionToExecute = functions?.find(
                  (f) => f.name === toolCall.function.name,
                );
                if (!functionToExecute) return;

                const name = toolCall.function.name;
                if (!name || !functionToExecute.code) return;

                const { output, newVariables } = await executeFunction({
                  variables: variables.list(),
                  body: functionToExecute.code,
                  args: parameters,
                  sessionStore,
                });

                if (newVariables && newVariables.length > 0)
                  await variables.set(newVariables);

                return {
                  tool_call_id: toolCall.id,
                  output: safeStringify(output) ?? "",
                };
              },
            ),
          )
        ).filter(isDefined);
        runResult = await forwardStream(
          openai.beta.threads.runs.submitToolOutputsStream(
            currentThreadId,
            runResult.id,
            { tool_outputs },
          ),
        );
      }
    });
  } catch (error) {
    logs?.add(await parseUnknownError({ err: error }));
  }
};

const createAssistantFoundationalStream = (
  process: ({
    forwardStream,
  }: {
    forwardStream: (stream: any) => Promise<any>;
  }) => Promise<void>,
) =>
  new ReadableStream({
    async start(controller) {
      const textEncoder = new TextEncoder();

      const sendError = (errorMessage: string) => {
        controller.enqueue(
          textEncoder.encode(formatDataStreamPart("error", errorMessage)),
        );
      };

      const forwardStream = async (stream: any) => {
        let result: any | undefined;

        for await (const value of stream) {
          switch (value.event) {
            case "thread.message.delta": {
              const content = value.data.delta.content?.[0];

              if (content?.type === "text" && content.text?.value != null) {
                controller.enqueue(
                  textEncoder.encode(
                    formatDataStreamPart("text", content.text.value),
                  ),
                );
              }
              break;
            }

            case "thread.run.completed":
            case "thread.run.requires_action": {
              result = value.data;
              break;
            }
          }
        }

        return result;
      };

      try {
        await process({
          forwardStream,
        });
      } catch (error) {
        sendError((error as any).message ?? `${error}`);
      } finally {
        controller.close();
      }
    },
    pull() {},
    cancel() {},
  });
