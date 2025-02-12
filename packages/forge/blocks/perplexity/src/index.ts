import { createBlock } from "@typebot.io/forge";
import { auth } from "./auth";
import { PerplexityLogo } from "./logo";

export const perplexityBlock = createBlock({
  id: "perplexity",
  name: "Perplexity",
  tags: ["ai", "chat", "completion", "sonar", "sonar-reasoning"],
  LightLogo: PerplexityLogo,
  auth,
  actions: [createChatMessage, generateVariables],
});
