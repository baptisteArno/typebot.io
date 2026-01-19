import { createAction, option } from "@typebot.io/forge";
import { auth } from "../auth";
import { baseOptions } from "../baseOptions";
import { openAIVoices, ttsModels } from "../constants";

export const speechModelsFetcher = {
  id: "fetchSpeechModels",
} as const;

export const createSpeech = createAction({
  name: "Create speech",
  auth,
  baseOptions,
  options: option.object({
    model: option.string.meta({
      layout: {
        fetcher: speechModelsFetcher.id,
        autoCompleteItems: ttsModels,
        placeholder: "Select a model",
      },
    }),
    input: option.string.meta({
      layout: {
        label: "Input",
        inputType: "textarea",
      },
    }),
    instructions: option.string.meta({
      layout: {
        label: "Instructions",
        inputType: "textarea",
        isHidden: (current: { model?: string }) =>
          current.model !== "gpt-4o-mini-tts",
      },
    }),
    voice: option.enum(openAIVoices).meta({
      layout: {
        label: "Voice",
        placeholder: "Select a voice",
      },
    }),
    saveUrlInVariableId: option.string.meta({
      layout: {
        inputType: "variableDropdown",
        label: "Save URL in variable",
      },
    }),
  }),
  fetchers: [speechModelsFetcher],
  getSetVariableIds: (options) =>
    options.saveUrlInVariableId ? [options.saveUrlInVariableId] : [],
});
