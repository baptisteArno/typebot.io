import { toolParametersSchema } from "@typebot.io/ai/schemas";
import { createAction, option } from "@typebot.io/forge";
import { isDefined } from "@typebot.io/lib/utils";
import { auth } from "../auth";
import { baseOptions } from "../baseOptions";
import { models } from "../constants";

export const askModel = createAction({
  auth,
  baseOptions,
  name: "Ask Model",
  options: option.object({
    model: option.string.meta({
      layout: {
        label: "Model",
        placeholder: "Select a model",
        autoCompleteItems: models,
        moreInfoTooltip: "The model to use for generating the response.",
      },
    }),
    message: option.string.meta({
      layout: {
        label: "Message",
        inputType: "textarea",
      },
    }),
    instructions: option.string.meta({
      layout: {
        label: "Instructions",
        inputType: "textarea",
        placeholder: "System instructions for the model...",
      },
    }),
    responseIdVariableId: option.string.meta({
      layout: {
        label: "Response ID",
        moreInfoTooltip:
          "Used to remember the conversation with the user. If empty, a new conversation is started.",
        inputType: "variableDropdown",
      },
    }),
    fileSearchVectorStoreIds: option.array(option.string).meta({
      layout: {
        label: "Vector store IDs",
        moreInfoTooltip:
          "Vector store IDs for file search. Leave empty to disable.",
        accordion: "Built-in tools",
      },
    }),
    fileSearchMaxNumResults: option.number.meta({
      layout: {
        label: "Number of retrieved chunks",
        moreInfoTooltip:
          "Maximum number of chunks to retrieve from the vector store. Applied only when Vector store IDs are set.",
        accordion: "Built-in tools",
        min: 1,
        max: 50,
        step: 1,
      },
    }),
    fileSearchScoreThreshold: option.number.meta({
      layout: {
        label: "Score threshold",
        moreInfoTooltip:
          "Minimum relevance score between 0 and 1 for retrieved chunks. Applied only when Vector store IDs are set.",
        accordion: "Built-in tools",
        min: 0,
        max: 1,
        step: 0.1,
        placeholder: "0.5",
      },
    }),
    webSearchEnabled: option.boolean.meta({
      layout: {
        label: "Web Search",
        accordion: "Built-in tools",
      },
    }),
    codeInterpreterEnabled: option.boolean.meta({
      layout: {
        label: "Code Interpreter",
        accordion: "Built-in tools",
      },
    }),
    functions: option
      .array(
        option.object({
          name: option.string.meta({
            layout: {
              label: "Name",
              placeholder: "myFunctionName",
              withVariableButton: false,
            },
          }),
          description: option.string.meta({
            layout: {
              label: "Description",
              placeholder: "A brief description of what this function does.",
              withVariableButton: false,
            },
          }),
          parameters: toolParametersSchema,
          code: option.string.meta({
            layout: {
              inputType: "code",
              label: "Code",
              lang: "js",
              moreInfoTooltip:
                "A javascript code snippet that can use the defined parameters. It should return a value.",
              withVariableButton: false,
            },
          }),
        }),
      )
      .meta({ layout: { accordion: "Functions", itemLabel: "function" } }),
    temperature: option.number.meta({
      layout: {
        label: "Temperature",
        accordion: "Advanced settings",
        direction: "row",
        defaultValue: 1,
      },
    }),
    responseMapping: option
      .saveResponseArray(["Message", "Response ID"] as const, {
        item: { hiddenItems: ["Response ID"] },
      })
      .meta({
        layout: {
          accordion: "Save response",
        },
      }),
  }),
  getSetVariableIds: ({ responseMapping, responseIdVariableId }) =>
    [
      ...(responseMapping?.map((r) => r.variableId) ?? []),
      responseIdVariableId,
    ].filter(isDefined),
  getStreamVariableId: ({ responseMapping }) =>
    responseMapping?.find((m) => !m.item || m.item === "Message")?.variableId,
});
