import { handleProductionWebhookRequest } from "@typebot.io/whatsapp/apiHandlers/handleProductionWebhookRequest";
import type { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ workspaceId: string; credentialsId: string }> },
) {
  const { workspaceId, credentialsId } = await ctx.params;
  return handleProductionWebhookRequest(request, {
    workspaceId,
    credentialsId,
  });
}
