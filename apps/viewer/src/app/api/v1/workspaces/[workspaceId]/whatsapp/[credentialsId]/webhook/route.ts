import prisma from "@typebot.io/prisma";
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

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");
  if (!token || !challenge)
    return new Response("Unauthorized", { status: 401 });
  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      token,
    },
  });
  if (!verificationToken) return new Response("Unauthorized", { status: 401 });
  await prisma.verificationToken.delete({
    where: {
      token,
    },
  });
  return new Response(challenge);
}
