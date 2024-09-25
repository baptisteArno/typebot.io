import { createBlock } from "@typebot.io/forge";
import { bookEvent } from "./actions/bookEvent";
import { baseOptions } from "./baseOptions";
import { CalComLogo } from "./logo";

export const calComBlock = createBlock({
  id: "cal-com",
  name: "Cal.com",
  tags: ["calendar", "scheduling", "meetings"],
  LightLogo: CalComLogo,
  options: baseOptions,
  actions: [bookEvent],
});
