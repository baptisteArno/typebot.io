import { createBlock } from "@typebot.io/forge";
import { createChatCompletion } from "./actions/createChatCompletion";
import { auth } from "./auth";
import { PerplexityDarkLogo, PerplexityLightLogo } from "./logo";

export const perplexityBlock = createBlock({
  id: "perplexity",
  name: "Perplexity",
  tags: ["ai", "chat", "completion", "sonar", "reasoning"],
  LightLogo: PerplexityLightLogo,
  DarkLogo: PerplexityDarkLogo,
  auth,
  actions: [createChatCompletion],
});
