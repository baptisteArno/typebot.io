import { createAction, option } from "@typebot.io/forge";
import { auth } from "../auth";

export const voicesFetcher = {
  id: "fetchVoices",
} as const;

export const modelsFetcher = {
  id: "fetchModels",
} as const;

export const convertTextToSpeech = createAction({
  name: "Convert text to speech",
  auth,
  options: option.object({
    text: option.string.layout({
      label: "Text",
      inputType: "textarea",
      placeholder: "Enter the text to convert to speech",
    }),
    voiceId: option.string.layout({
      fetcher: voicesFetcher.id,
      label: "Voice",
      placeholder: "Select a voice",
    }),
    modelId: option.string.layout({
      fetcher: modelsFetcher.id,
      label: "Model",
      placeholder: "Select a model",
    }),
    saveUrlInVariableId: option.string.layout({
      label: "Save audio URL in variable",
      placeholder: "Select a variable",
      inputType: "variableDropdown",
    }),
  }),
  fetchers: [voicesFetcher, modelsFetcher],
  getSetVariableIds: ({ saveUrlInVariableId }) =>
    saveUrlInVariableId ? [saveUrlInVariableId] : [],
});
