import { createAction, option } from "@typebot.io/forge";
import { auth } from "../auth";

export const alias = createAction({
  auth,
  name: "Alias",
  options: option.object({
    userId: option.string.meta({
      layout: {
        label: "User ID",
        isRequired: true,
        moreInfoTooltip: "New ID of the user.",
      },
    }),
    previousId: option.string.meta({
      layout: {
        label: "Previous ID",
        moreInfoTooltip: "Previous ID of the user to alias.",
      },
    }),
  }),
});
