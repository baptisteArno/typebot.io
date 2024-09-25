import { router } from "@/helpers/server/trpc";
import { getResultExample } from "./getResultExample";
import { listWebhookBlocks } from "./listWebhookBlocks";
import { subscribeWebhook } from "./subscribeWebhook";
import { unsubscribeWebhook } from "./unsubscribeWebhook";

export const webhookRouter = router({
  listWebhookBlocks,
  getResultExample,
  subscribeWebhook,
  unsubscribeWebhook,
});
