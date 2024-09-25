import { createBlock } from "@typebot.io/forge";
import { createChatMessage } from "./actions/createChatMessage";
import { generateVariables } from "./actions/generateVariables";
import { auth } from "./auth";
import { AnthropicLogo } from "./logo";

export const anthropicBlock = createBlock({
  id: "anthropic",
  name: "Anthropic",
  tags: ["ai", "chat", "completion", "claude", "sonnet", "haiku"],
  LightLogo: AnthropicLogo,
  auth,
  actions: [createChatMessage, generateVariables],
});
