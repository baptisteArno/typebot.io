import { createBlock } from "@typebot.io/forge";
import { convertTextToSpeech } from "./actions/convertTextToSpeech";
import { auth } from "./auth";
import { ElevenlabsLogo, ElevenlabsLogoDark } from "./logo";

export const elevenlabsBlock = createBlock({
  id: "elevenlabs",
  name: "ElevenLabs",
  tags: ["ai", "voice", "generation"],
  LightLogo: ElevenlabsLogo,
  DarkLogo: ElevenlabsLogoDark,
  auth,
  actions: [convertTextToSpeech],
  docsUrl: "https://docs.typebot.io/forge/blocks/elevenlabs",
});
