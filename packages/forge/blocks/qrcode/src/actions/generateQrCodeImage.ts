import { createAction, option } from "@typebot.io/forge";

export const generateQrCode = createAction({
  name: "Generate a QR Code",
  options: option.object({
    data: option.string.layout({
      label: "Data",
      helperText:
        "This can be a URL, or any text data you want to encode into a QR code.",
    }),
    saveUrlInVariableId: option.string.layout({
      label: "Save QR code image URL",
      inputType: "variableDropdown",
    }),
  }),
  getSetVariableIds: (options) =>
    options.saveUrlInVariableId ? [options.saveUrlInVariableId] : [],
});
