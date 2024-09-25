import { createBlock } from "@typebot.io/forge";
import { createChatCompletion } from "./actions/createChatCompletion";
import { generateVariables } from "./actions/generateVariables";
import { auth } from "./auth";
import { MistralLogo } from "./logo";

export const mistralBlock = createBlock({
  id: "mistral",
  name: "Mistral",
  tags: ["ai", "chat", "completion"],
  LightLogo: MistralLogo,
  auth,
  actions: [createChatCompletion, generateVariables],
  docsUrl: "https://docs.typebot.io/forge/blocks/mistral",
});
