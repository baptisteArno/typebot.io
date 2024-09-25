import { createBlock } from "@typebot.io/forge";
import { createChatCompletion } from "./actions/createChatCompletion";
import { auth } from "./auth";
import { TogetherAiLogo } from "./logo";

export const togetherAiBlock = createBlock({
  id: "together-ai",
  name: "Together",
  fullName: "Together AI",
  tags: ["ai", "openai", "chat", "completion"],
  LightLogo: TogetherAiLogo,
  auth,
  actions: [createChatCompletion],
});
