import { router } from "@/helpers/server/trpc";
import { subscribeWebhook } from "./subscribeWebhook";

export const whatsAppRouter = router({
  subscribeWebhook,
});
