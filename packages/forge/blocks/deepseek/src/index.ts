import { createBlock } from "@typebot.io/forge";
import { createChatCompletion } from "./actions/createChatCompletions";
import { auth } from "./auth";
import { DeepSeekLogo } from "./logo";

export const deepSeekBlock = createBlock({
  id: "deepseek",
  name: "DeepSeek",
  tags: ["ai", "chat", "completion", "deepseek", "reasoner"],
  LightLogo: DeepSeekLogo,
  auth,
  actions: [createChatCompletion],
});
