import { createAction, option } from "@typebot.io/forge";
import { auth } from "../auth";

export const redirect = createAction({
  name: "Redirect",
  auth,
  options: option.object({
    url: option.string.optional().layout({
      label: "URL",
      placeholder: "https://app.joinblink.com/#/hub/xxxx-xxxx",
    }),
  }),
});
