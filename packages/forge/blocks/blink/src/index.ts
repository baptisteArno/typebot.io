import { createBlock } from "@typebot.io/forge";
import { getUsers } from "./actions/getUsers";
import { sendFeedEvent } from "./actions/sendFeedEvent";
import { auth } from "./auth";
import { BlinkLogo } from "./logo";

export const blinkBlock = createBlock({
  id: "blink",
  name: "Blink",
  tags: ["CRM", "HR"],
  LightLogo: BlinkLogo,
  auth,
  actions: [getUsers, sendFeedEvent],
  docsUrl: "https://docs.typebot.io/editor/blocks/integrations/blink",
});
