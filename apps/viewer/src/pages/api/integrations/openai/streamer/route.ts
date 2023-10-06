import { connect } from '@planetscale/database'
import { env } from '@typebot.io/env'
import { IntegrationBlockType, SessionState } from '@typebot.io/schemas'
import { StreamingTextResponse } from 'ai'
import { getChatCompletionStream } from '@typebot.io/bot-engine/blocks/integrations/openai/getChatCompletionStream'
import OpenAI from 'openai'
import { NextResponse } from 'next/dist/server/web/spec-extension/response'

export const runtime = 'edge'
export const regions = ['lhr1']
export const dynamic = 'force-dynamic'

const responseHeaders = {
  'Access-Control-Allow-Origin': '*',
}

const handler = async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Expose-Headers': 'Content-Length, X-JSON',
        'Access-Control-Allow-Headers': '*',
      },
    })
  }
  const { sessionId, messages } = (await req.json()) as {
    sessionId: string
    messages: OpenAI.Chat.ChatCompletionMessage[]
  }

  if (!sessionId)
    return NextResponse.json(
      { message: 'No session ID provided' },
      { status: 400, headers: responseHeaders }
    )

  if (!messages)
    return NextResponse.json(
      { message: 'No messages provided' },
      { status: 400, headers: responseHeaders }
    )

  const conn = connect({ url: env.DATABASE_URL })

  const chatSession = await conn.execute(
    'select state from ChatSession where id=?',
    [sessionId]
  )

  const state = (chatSession.rows.at(0) as { state: SessionState } | undefined)
    ?.state

  if (!state)
    return NextResponse.json(
      { message: 'No state found' },
      { status: 400, headers: responseHeaders }
    )

  const group = state.typebotsQueue[0].typebot.groups.find(
    (group) => group.id === state.currentBlock?.groupId
  )
  const blockIndex =
    group?.blocks.findIndex(
      (block) => block.id === state.currentBlock?.blockId
    ) ?? -1

  const block = blockIndex >= 0 ? group?.blocks[blockIndex ?? 0] : null

  if (!block || !group)
    return NextResponse.json(
      { message: 'Current block not found' },
      { status: 400, headers: responseHeaders }
    )

  if (
    block.type !== IntegrationBlockType.OPEN_AI ||
    block.options.task !== 'Create chat completion'
  )
    return NextResponse.json(
      { message: 'Current block is not an OpenAI block' },
      { status: 400, headers: responseHeaders }
    )

  try {
    const stream = await getChatCompletionStream(conn)(
      state,
      block.options,
      messages
    )
    if (!stream)
      return NextResponse.json(
        { message: 'Could not create stream' },
        { status: 400, headers: responseHeaders }
      )

    return new StreamingTextResponse(stream, {
      headers: responseHeaders,
    })
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      const { name, status, message } = error
      return NextResponse.json(
        { name, status, message },
        { status, headers: responseHeaders }
      )
    } else {
      throw error
    }
  }
}

export default handler
