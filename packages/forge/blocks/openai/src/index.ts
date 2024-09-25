import { createBlock } from "@typebot.io/forge";
import { askAssistant } from "./actions/askAssistant";
import { createChatCompletion } from "./actions/createChatCompletion";
import { createSpeech } from "./actions/createSpeech";
import { createTranscription } from "./actions/createTranscription";
import { generateVariables } from "./actions/generateVariables";
import { auth } from "./auth";
import { baseOptions } from "./baseOptions";
import { OpenAIDarkLogo, OpenAILightLogo } from "./logo";

export const openAIBlock = createBlock({
  id: "openai" as const,
  name: "OpenAI",
  tags: ["openai"],
  LightLogo: OpenAILightLogo,
  DarkLogo: OpenAIDarkLogo,
  auth,
  options: baseOptions,
  actions: [
    createChatCompletion,
    askAssistant,
    generateVariables,
    createSpeech,
    createTranscription,
  ],
  docsUrl: "https://docs.typebot.io/forge/blocks/openai",
});
