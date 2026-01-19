import { createAction, option } from "@typebot.io/forge";
import { auth } from "../auth";

export const openWebWidget = createAction({
  auth,
  name: "Open Web Widget",
  options: option.object({
    userId: option.string.meta({
      layout: {
        label: "User ID",
      },
    }),
    name: option.string.meta({
      layout: {
        label: "Name",
      },
    }),
    email: option.string.meta({
      layout: {
        label: "Email",
      },
    }),
    webWidgetKey: option.string.meta({
      layout: {
        label: "Web Widget Key",
        helperText:
          "[Finding web widget key](https://docs.typebot.io/editor/blocks/integrations/zendesk#open-web-widget)",
      },
    }),
  }),
});
