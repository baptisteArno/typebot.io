import { createBlock } from "@typebot.io/forge";
import { getCall } from "./actions/getCall";
import { startCall } from "./actions/startCall";
import { auth } from "./auth";
import { FamulorLogo } from "./logo";

export const famulorBlock = createBlock({
  id: "famulor",
  name: "Famulor",
  tags: ["ai", "voice", "phone"],
  LightLogo: FamulorLogo,
  auth,
  actions: [startCall, getCall],
  docsUrl: "https://docs.typebot.com/editor/blocks/integrations/famulor",
});
