import { option } from "@typebot.io/forge";
import { defaultBaseUrl } from "./constants";

export const baseOptions = option.object({
  baseUrl: option.string.meta({
    layout: {
      label: "Base origin",
      placeholder: "https://cal.com",
      defaultValue: defaultBaseUrl,
      accordion: "Customize host",
    },
  }),
});
