import {
  HttpMethod,
  defaultWebhookAttributes,
} from "@typebot.io/blocks-integrations/webhook/constants";
import type { HttpRequest } from "@typebot.io/blocks-integrations/webhook/schema";
import type { Prisma } from "@typebot.io/prisma/types";
import { isWebhookBlock } from "../helpers";
import type { BlockV5 } from "../schemas/schema";

export const migrateWebhookBlock =
  (webhooks: Prisma.Webhook[]) =>
  (block: BlockV5): BlockV5 => {
    if (!isWebhookBlock(block)) return block;
    const webhook = webhooks.find(
      (webhook) => "webhookId" in block && webhook.id === block.webhookId,
    );
    return {
      ...block,
      webhookId: undefined,
      options: {
        ...block.options,
        webhook: webhook
          ? {
              id: webhook.id,
              url: webhook.url ?? undefined,
              method:
                (webhook.method as HttpRequest["method"]) ?? HttpMethod.POST,
              headers: (webhook.headers as HttpRequest["headers"]) ?? [],
              queryParams:
                (webhook.queryParams as HttpRequest["headers"]) ?? [],
              body: webhook.body ?? undefined,
            }
          : {
              ...defaultWebhookAttributes,
              id: "webhookId" in block ? (block.webhookId ?? "") : "",
            },
      },
    };
  };
