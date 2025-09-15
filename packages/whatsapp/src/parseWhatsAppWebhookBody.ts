import type { NextRequest } from "next/server";
import {
  type WhatsAppWebhookRequestBody,
  whatsAppWebhookRequestBodySchema,
} from "./schemas";

export const parseWhatsAppWebhookBody = async (
  request: NextRequest,
): Promise<WhatsAppWebhookRequestBody["entry"] | undefined> => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    console.warn("Invalid JSON body");
    return;
  }
  const parsed = whatsAppWebhookRequestBodySchema.safeParse(body);
  if (!parsed.success) {
    console.warn("Unknown body schema", JSON.stringify(body, null, 2));
    return;
  }
  return parsed.data.entry;
};
