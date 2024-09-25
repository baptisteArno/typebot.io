import { createBlock } from "@typebot.io/forge";
import { auth } from "./auth";
import { HackernewsLogo } from "./logo";

export const hackernewsBlock = createBlock({
  id: "hackernews",
  name: "Hackernews",
  tags: [],
  LightLogo: HackernewsLogo,
  auth,
  actions: [],
});
