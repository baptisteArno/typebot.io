import { getMessageStream } from "@typebot.io/bot-engine/apiHandlers/getMessageStream";
import { StreamingTextResponse } from "@typebot.io/legacy/ai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge"; // Utilize Edge Runtime for faster responses

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "Content-Length, X-JSON",
  "Access-Control-Allow-Headers": "*",
};

const createErrorResponse = (message: string, status: number) =>
  NextResponse.json({ message }, { status, headers: CORS_HEADERS });

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(
  req: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { messages } = await req.json().catch(() => ({}));

    const { stream, status, message } = await getMessageStream({
      sessionId: params.sessionId,
      messages,
    });

    if (!stream) return createErrorResponse(message || "Stream creation failed", status || 500);

    return new StreamingTextResponse(stream.pipeThrough(createOptimizedTransformer()), {
      headers: CORS_HEADERS,
    });
  } catch (error) {
    console.error("Stream processing error:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

// Optimized stream transformer with single encoder/decoder instance
const createOptimizedTransformer = () => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = "";

  return new TransformStream({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      
      // Process complete JSON chunks only
      while (buffer.includes('\n')) {
        const lineEndIndex = buffer.indexOf('\n');
        const line = buffer.slice(0, lineEndIndex);
        buffer = buffer.slice(lineEndIndex + 1);

        if (line.startsWith('0:')) {
          try {
            const data = JSON.parse(line.slice(2));
            controller.enqueue(encoder.encode(data));
          } catch (error) {
            console.warn("Failed to parse chunk:", line);
          }
        }
      }
    },
    
    flush(controller) {
      if (buffer.length > 0) {
        controller.enqueue(encoder.encode(buffer));
      }
    }
  });
};
