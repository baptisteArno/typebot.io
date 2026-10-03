import { createBlock } from "@typebot.io/forge";
import { convertTextToSpeech } from "./actions/convertTextToSpeech";
import { auth } from "./auth";
import { GandrLogo, GandrLogoDark } from "./logo";

export const gandrBlock = createBlock({
  id: "gandr",
  name: "Gandr",
  tags: ["ai", "voice", "generation"],
  LightLogo: GandrLogo,
  DarkLogo: GandrLogoDark,
  auth,
  actions: [convertTextToSpeech],
});
