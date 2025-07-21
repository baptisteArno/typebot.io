import { createBlock } from "@typebot.io/forge";
import { sendEmail } from "./actions/sendEmail";
import { auth } from "./auth";
import { GmailLogo } from "./logo";

export const gmailBlock = createBlock({
  id: "gmail",
  name: "Gmail",
  tags: [],
  LightLogo: GmailLogo,
  auth,
  actions: [sendEmail],
});
