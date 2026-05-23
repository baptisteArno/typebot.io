import { createAction, option } from "@typebot.io/forge";
import { auth } from "../auth";
import { elevenLabsModels } from "../constants";

export const voicesFetcher = {
  id: "fetchVoices",
} as const;

export const convertTextToSpeech = createAction({
  name: "Convert text to speech",
  auth,
  options: option.object({
    text: option.string.meta({
      layout: {
        label: "Text",
        inputType: "textarea",
        placeholder: "Enter the text to convert to speech",
      },
    }),
    voiceId: option.string.meta({
      layout: {
        fetcher: voicesFetcher.id,
        label: "Voice",
        placeholder: "Select a voice",
      },
    }),
    modelId: option.string.meta({
      layout: {
        autoCompleteItems: elevenLabsModels,
        label: "Model",
        placeholder: "Select a model",
      },
    }),
    saveUrlInVariableId: option.string.meta({
      layout: {
        label: "Save audio URL in variable",
        placeholder: "Select a variable",
        inputType: "variableDropdown",
      },
    }),
  }),
  fetchers: [voicesFetcher],
  getSetVariableIds: ({ saveUrlInVariableId }) =>
    saveUrlInVariableId ? [saveUrlInVariableId] : [],
});
