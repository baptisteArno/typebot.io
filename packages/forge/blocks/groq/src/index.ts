import { createBlock } from "@typebot.io/forge";
import { createChatCompletion } from "./actions/createChatCompletion";
import { auth } from "./auth";
import { GroqLogo } from "./logo";

export const groqBlock = createBlock({
  id: "groq",
  name: "Groq",
  tags: ["ai", "chat completion", "bot"],
  LightLogo: GroqLogo,
  auth,
  actions: [createChatCompletion],
});
