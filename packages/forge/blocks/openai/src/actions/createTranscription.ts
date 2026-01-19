import { createAction, option } from "@typebot.io/forge";
import { auth } from "../auth";
import { baseOptions } from "../baseOptions";

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
