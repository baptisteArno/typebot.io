import { handlePreviewWebhookRequest } from "@typebot.io/whatsapp/apiHandlers/handlePreviewWebhookRequest";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return handlePreviewWebhookRequest(request);
}
