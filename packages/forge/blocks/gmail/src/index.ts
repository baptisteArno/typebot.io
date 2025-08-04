import { createBlock } from "@typebot.io/forge";
import { sendEmail } from "./actions/sendEmail";
import { auth } from "./auth";
import { GmailLogo } from "./logo";

export const gmailBlock = createBlock({
  id: "gmail",
  name: "Gmail",
  badge: "beta",
  tags: ["email", "notification", "send"],
  LightLogo: GmailLogo,
  auth,
  actions: [sendEmail],
});
