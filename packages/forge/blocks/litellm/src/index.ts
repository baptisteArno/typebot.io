import { createBlock } from "@typebot.io/forge";
import { createChatCompletion } from "./actions/createChatCompletion";
import { auth } from "./auth";
import { LiteLLMLogo } from "./logo";

export const litellmBlock = createBlock({
  id: "litellm",
  name: "LiteLLM",
  tags: ["ai", "chat completion", "bot", "gateway"],
  LightLogo: LiteLLMLogo,
  auth,
  actions: [createChatCompletion],
});
