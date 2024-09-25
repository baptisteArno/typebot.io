import { createBlock } from "@typebot.io/forge";
import { sendMessage } from "./actions/sendMessage";
import { auth } from "./auth";
import { ChatNodeLogo } from "./logo";

export const chatNodeBlock = createBlock({
  id: "chat-node",
  name: "ChatNode",
  tags: ["ai", "openai", "document", "url"],
  LightLogo: ChatNodeLogo,
  auth,
  actions: [sendMessage],
});
