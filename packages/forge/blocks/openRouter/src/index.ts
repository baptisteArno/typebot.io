import { createBlock } from "@typebot.io/forge";
import { createChatCompletion } from "./actions/createChatCompletion";
import { auth } from "./auth";
import { OpenRouterLogo } from "./logo";

export const openRouterBlock = createBlock({
  id: "open-router",
  name: "OpenRouter",
  tags: ["ai", "openai", "chat", "completion"],
  LightLogo: OpenRouterLogo,
  auth,
  actions: [createChatCompletion],
});
