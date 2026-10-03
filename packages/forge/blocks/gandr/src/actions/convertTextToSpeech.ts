import { createAction, option } from "@typebot.io/forge";
import { auth } from "../auth";

export const convertTextToSpeech = createAction({
  name: "Convert text to speech",
  auth,
  options: option.object({
    text: option.string.meta({
      layout: {
        label: "Text",
        inputType: "textarea",
        placeholder: "Enter the text to convert to speech",
        helperText: "Maximum 2000 characters per request.",
      },
    }),
    voice: option
      .enum([
        "gandr-mia",
        "gandr-ava",
        "gandr-jenny",
        "gandr-dane",
        "gandr-leo",
        "gandr-lewis",
      ])
      .meta({
        layout: {
          label: "Voice",
          defaultValue: "gandr-mia",
        },
      }),
    responseFormat: option.enum(["mp3", "wav", "pcm"]).meta({
      layout: {
        label: "Response format",
        defaultValue: "mp3",
        helperText:
          "pcm is raw signed 16 bit little endian mono audio at 24000 Hz.",
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
  getSetVariableIds: ({ saveUrlInVariableId }) =>
    saveUrlInVariableId ? [saveUrlInVariableId] : [],
});
