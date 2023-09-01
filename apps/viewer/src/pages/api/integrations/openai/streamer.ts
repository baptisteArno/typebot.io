import { getChatCompletionStream } from '@/features/blocks/integrations/openai/getChatCompletionStream'
import { connect } from '@planetscale/database'
import { env } from '@typebot.io/env'
import { IntegrationBlockType, SessionState } from '@typebot.io/schemas'
import { StreamingTextResponse } from 'ai'
import { ChatCompletionRequestMessage } from 'openai-edge'

export const config = {
  runtime: 'edge',
  regions: ['lhr1'],
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
    messages: ChatCompletionRequestMessage[]
  }

  if (!sessionId) return new Response('No session ID provided', { status: 400 })

  if (!messages) return new Response('No messages provided', { status: 400 })

  const conn = connect({ url: env.DATABASE_URL })

  const chatSession = await conn.execute(
    'select state from ChatSession where id=?',
    [sessionId]
  )

  const state = (chatSession.rows.at(0) as { state: SessionState } | undefined)
    ?.state

  if (!state) return new Response('No state found', { status: 400 })

  const group = state.typebotsQueue[0].typebot.groups.find(
    (group) => group.id === state.currentBlock?.groupId
  )
  const blockIndex =
    group?.blocks.findIndex(
      (block) => block.id === state.currentBlock?.blockId
    ) ?? -1

  const block = blockIndex >= 0 ? group?.blocks[blockIndex ?? 0] : null

  if (!block || !group)
    return new Response('Current block not found', { status: 400 })

  if (
    block.type !== IntegrationBlockType.OPEN_AI ||
    block.options.task !== 'Create chat completion'
  )
    return new Response('Current block is not an OpenAI block', { status: 400 })

  const streamOrResponse = await getChatCompletionStream(conn)(
    state,
    block.options,
    messages
  )

  if (!streamOrResponse)
    return new Response('Could not create stream', { status: 400 })

  if ('ok' in streamOrResponse)
    return new Response(streamOrResponse.body, {
      status: streamOrResponse.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    })

  return new StreamingTextResponse(streamOrResponse, {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  })
}

export default handler
