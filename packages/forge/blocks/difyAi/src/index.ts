import { createBlock } from "@typebot.io/forge";
import { createChatMessage } from "./actions/createChatMessage";
import { auth } from "./auth";
import { DifyAiLogo } from "./logo";

export const difyAiBlock = createBlock({
  id: "dify-ai",
  name: "Dify.AI",
  tags: ["dify", "ai", "documents", "files", "knowledge base"],
  LightLogo: DifyAiLogo,
  auth,
  actions: [createChatMessage],
});
