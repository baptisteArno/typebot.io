import { getMessageStream } from "@typebot.io/bot-engine/apiHandlers/getMessageStream";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const responseHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "Content-Length, X-JSON",
  "Access-Control-Allow-Headers": "*",
};

export async function OPTIONS() {
  return new Response("ok", {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Expose-Headers": "Content-Length, X-JSON",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;
  const body = await req.text();
  const messages = body ? JSON.parse(body).messages : undefined;
  const { stream, status, message, details, context } = await getMessageStream({
    sessionId,
    messages,
  });
  if (!stream)
    return NextResponse.json(
      { message, status, details, context },
      { headers: responseHeaders },
    );
  return new Response(stream, {
    headers: responseHeaders,
  });
}
