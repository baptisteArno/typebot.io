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
  if (process.env.VERCEL_ENV)
    return NextResponse.json(
      { message: "Can't get streaming if hosted on Vercel" },
      { status: 400, headers: responseHeaders }
    )
  const messages =
    typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const { stream, status, message } = await getMessageStream({
    sessionId: params.sessionId,
    messages,
  })
  if (!stream)
    return NextResponse.json({ message }, { status, headers: responseHeaders })
  return new StreamingTextResponse(stream, {
    headers: responseHeaders,
  })
}
