import { createAction, option } from "@typebot.io/forge";
import { auth } from "../auth";

export const openWebWidget = createAction({
  auth,
  name: "Open Web Widget",
  options: option.object({
    userId: option.string.layout({
      label: "User ID",
    }),
    name: option.string.layout({
      label: "Name",
    }),
    email: option.string.layout({
      label: "Email",
    }),
    webWidgetKey: option.string.layout({
      label: "Web Widget Key",
      helperText:
        "[Finding web widget key](https://docs.typebot.io/editor/blocks/integrations/zendesk#open-web-widget)",
    }),
  }),
});
