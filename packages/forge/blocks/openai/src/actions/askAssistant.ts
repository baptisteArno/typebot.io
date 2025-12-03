import { createAction, option } from "@typebot.io/forge";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { isDefined } from "@typebot.io/lib/utils";
import { type ClientOptions, OpenAI } from "openai";
import { auth } from "../auth";
import { baseOptions } from "../baseOptions";
import { deprecatedAskAssistantOptions } from "../deprecated";

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
  getStreamVariableId: ({ responseMapping }) =>
    responseMapping?.find((m) => !m.item || m.item === "Message")?.variableId,
});
