import { router } from "@/helpers/server/trpc";
import { receiveMessage } from "./receiveMessage";
import { subscribeWebhook } from "./subscribeWebhook";

export const whatsAppRouter = router({
  subscribeWebhook,
  receiveMessage,
});
