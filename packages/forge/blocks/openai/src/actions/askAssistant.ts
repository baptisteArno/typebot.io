import { createAction, option } from "@typebot.io/forge";
import { isDefined } from "@typebot.io/lib/utils";
import { auth } from "../auth";
import { baseOptions } from "../baseOptions";
import { deprecatedAskAssistantOptions } from "../deprecated";

export const assistantsFetcher = {
  id: "fetchAssistants",
} as const;

export const assistantFunctionsFetcher = {
  id: "fetchAssistantFunctions",
} as const;

export const askAssistant = createAction({
  auth,
  baseOptions,
  name: "Ask Assistant",
  options: option
    .object({
      assistantId: option.string.meta({
        layout: {
          label: "Assistant ID",
          placeholder: "Select an assistant",
          moreInfoTooltip: "The OpenAI assistant you want to ask question to.",
          fetcher: assistantsFetcher.id,
        },
      }),
      threadVariableId: option.string.meta({
        layout: {
          label: "Thread ID",
          moreInfoTooltip:
            "Used to remember the conversation with the user. If empty, a new thread is created.",
          inputType: "variableDropdown",
        },
      }),

      message: option.string.meta({
        layout: {
          label: "Message",
          inputType: "textarea",
        },
      }),
      functions: option
        .array(
          option.object({
            name: option.string.meta({
              layout: {
                fetcher: assistantFunctionsFetcher.id,
                label: "Name",
              },
            }),
            code: option.string.meta({
              layout: {
                inputType: "code",
                label: "Code",
                lang: "javascript",
                moreInfoTooltip:
                  "A javascript code snippet that can use the defined parameters. It should return a value.",
                withVariableButton: false,
              },
            }),
          }),
        )
        .meta({ layout: { accordion: "Functions", itemLabel: "function" } }),
      additionalInstructions: option.string.meta({
        layout: {
          label: "Additional Instructions",
          inputType: "textarea",
          accordion: "Advanced settings",
        },
      }),
      responseMapping: option
        .saveResponseArray(["Message", "Thread ID"] as const, {
          item: { hiddenItems: ["Thread ID"] },
        })
        .meta({
          layout: {
            accordion: "Save response",
          },
        }),
    })
    .merge(deprecatedAskAssistantOptions),
  fetchers: [assistantsFetcher, assistantFunctionsFetcher],
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping?.map((r) => r.variableId).filter(isDefined) ?? [],
  getStreamVariableId: ({ responseMapping }) =>
    responseMapping?.find((m) => !m.item || m.item === "Message")?.variableId,
});
