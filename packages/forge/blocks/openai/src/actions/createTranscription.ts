import { createAction, option } from "@typebot.io/forge";
import { auth } from "../auth";
import { baseOptions } from "../baseOptions";
import { transcriptionModels } from "../constants";

export const createTranscription = createAction({
  name: "Create transcription",
  auth,
  baseOptions,
  options: option.object({
    url: option.string.meta({
      layout: {
        label: "Audio URL",
      },
    }),
    model: option.string.optional().meta({
      layout: {
        autoCompleteItems: transcriptionModels,
        label: "Model",
        placeholder: "Select a model",
      },
    }),
    prompt: option.string.optional().meta({
      layout: {
        label: "Prompt",
        inputType: "textarea",
      },
    }),
    transcriptionVariableId: option.string.meta({
      layout: {
        label: "Save result to",
        inputType: "variableDropdown",
      },
    }),
  }),
  getSetVariableIds: (options) =>
    options.transcriptionVariableId ? [options.transcriptionVariableId] : [],
});
