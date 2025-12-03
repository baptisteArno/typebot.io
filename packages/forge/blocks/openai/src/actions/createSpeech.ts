import { createAction, option } from "@typebot.io/forge";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { type ClientOptions, OpenAI } from "openai";
import { auth } from "../auth";
import { baseOptions } from "../baseOptions";
import { openAIVoices, ttsModels } from "../constants";

export const createSpeech = createAction({
  name: "Create speech",
  auth,
  baseOptions,
  options: option.object({
    model: option.string.layout({
      fetcher: "fetchSpeechModels",
      autoCompleteItems: ttsModels,
      placeholder: "Select a model",
    }),
    input: option.string.layout({
      label: "Input",
      inputType: "textarea",
    }),
    instructions: option.string.layout({
      label: "Instructions",
      inputType: "textarea",
      isHidden: (option) => option.model !== "gpt-4o-mini-tts",
    }),
    voice: option.enum(openAIVoices).layout({
      label: "Voice",
      placeholder: "Select a voice",
    }),
    saveUrlInVariableId: option.string.layout({
      inputType: "variableDropdown",
      label: "Save URL in variable",
    }),
  }),
  getSetVariableIds: (options) =>
    options.saveUrlInVariableId ? [options.saveUrlInVariableId] : [],
  fetchers: [
    {
      id: "fetchSpeechModels",
      dependencies: ["baseUrl", "apiVersion"],
      fetch: async ({ credentials, options }) => {
        if (!credentials?.apiKey)
          return {
            data: [],
          };

        const baseUrl = options?.baseUrl;
        const config = {
          apiKey: credentials.apiKey,
          baseURL: baseUrl,
          defaultHeaders: {
            "api-key": credentials.apiKey,
          },
          defaultQuery: options?.apiVersion
            ? {
                "api-version": options.apiVersion,
              }
            : undefined,
        } satisfies ClientOptions;

        const openai = new OpenAI(config);

        try {
          const models = await openai.models.list();
          return {
            data:
              models.data
                .filter((model) => model.id.includes("tts"))
                .sort((a, b) => b.created - a.created)
                .map((model) => model.id) ?? [],
          };
        } catch (err) {
          return {
            error: await parseUnknownError({
              err,
              context: "While fetching OpenAI speech models",
            }),
          };
        }
      },
    },
  ],
});
