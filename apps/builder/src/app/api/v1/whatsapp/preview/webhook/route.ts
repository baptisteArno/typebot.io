import { env } from "@typebot.io/env";
import { handlePreviewWebhookRequest } from "@typebot.io/whatsapp/api/handlePreviewWebhookRequest";
import {
  type WhatsAppWebhookRequestBody,
  whatsAppWebhookRequestBodySchema,
} from "@typebot.io/whatsapp/schemas";
import type { NextRequest } from "next/server";

// TODO: Use oRPC whatsapp router when migrated builder to orpc

export async function POST(request: NextRequest) {
  const response = new Response("Message received", { status: 200 });

  if (!env.WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID) {
    console.error("WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID is not defined");
    return response;
  }

  const entry = await parseWhatsAppWebhookBody(request);

  if (!entry) return response;

  const result = await handlePreviewWebhookRequest({ input: { entry } });

  return new Response(result, { status: 200 });
}

const parseWhatsAppWebhookBody = async (
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
