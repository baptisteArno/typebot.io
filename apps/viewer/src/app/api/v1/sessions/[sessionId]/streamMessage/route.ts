import { getMessageStream } from '@typebot.io/bot-engine/apiHandlers/getMessageStream'
import { StreamingTextResponse } from 'ai'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const responseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Expose-Headers': 'Content-Length, X-JSON',
  'Access-Control-Allow-Headers': '*',
}

export async function OPTIONS() {
  return new Response('ok', {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Expose-Headers': 'Content-Length, X-JSON',
      'Access-Control-Allow-Headers': '*',
    },
  })
}

export async function POST(
  req: Request,
  { params }: { params: { sessionId: string } }
) {
  const body = await req.text()
  const messages = body ? JSON.parse(body).messages : undefined
  const { stream, status, message } = await getMessageStream({
    sessionId: params.sessionId,
    messages,
  })
  if (!stream)
    return NextResponse.json({ message }, { status, headers: responseHeaders })
  return new StreamingTextResponse(
    stream.pipeThrough(createStreamDataTransformer()),
    {
      headers: responseHeaders,
    }
  )
}

const createStreamDataTransformer = () => {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  return new TransformStream({
    transform: async (chunk, controller) => {
      const decodedChunk = decoder.decode(chunk)
      if (decodedChunk[0] !== '0') return
      controller.enqueue(encoder.encode(JSON.parse(decodedChunk.slice(2))))
    },
  })
}
