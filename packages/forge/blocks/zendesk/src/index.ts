import { createBlock } from "@typebot.io/forge";
import { openWebWidget } from "./actions/openWebWidget";
import { auth } from "./auth";
import { ZendeskLogo } from "./logo";

export const zendeskBlock = createBlock({
  id: "zendesk",
  name: "Zendesk",
  tags: ["live chat", "crm", "support"],
  LightLogo: ZendeskLogo,
  auth,
  actions: [openWebWidget],
  docsUrl: "https://docs.typebot.io/editor/blocks/integrations/zendesk",
});
