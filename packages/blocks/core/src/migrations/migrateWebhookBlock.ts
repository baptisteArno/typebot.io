import {
  HttpMethod,
  defaultHttpRequestAttributes,
} from "@typebot.io/blocks-integrations/httpRequest/constants";
import type { HttpRequest } from "@typebot.io/blocks-integrations/httpRequest/schema";
import type { Prisma } from "@typebot.io/prisma/types";
import { isHttpRequestBlock } from "../helpers";
import type { BlockV5 } from "../schemas/schema";

export const migrateWebhookBlock =
  (webhooks: Prisma.Webhook[]) =>
  (block: BlockV5): BlockV5 => {
    if (!isHttpRequestBlock(block)) return block;
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
              ...defaultHttpRequestAttributes,
              id: "webhookId" in block ? (block.webhookId ?? "") : "",
            },
      },
    };
  };
