import { auth } from "@typebot.io/auth/lib/nextAuth";
import { getMessageStream } from "@typebot.io/bot-engine/apiHandlers/getMessageStream";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { sessionId } = await params;
  const body = await req.text();
  const messages = body ? JSON.parse(body).messages : undefined;
  try {
    const { stream, status, message, details, context } =
      await getMessageStream({
        sessionId,
        messages,
      });
    if (!stream) {
      console.error("Stream message error:", {
        message,
        status,
        details,
        context,
      });
      return NextResponse.json(
        { message, details, context },
        { status: status ?? 500 },
      );
    }
    return new Response(stream);
  } catch (error) {
    console.error("Stream message unhandled error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
