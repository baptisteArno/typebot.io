type MessageChunk = {
  event: 'message'
  answer: string
}

type AgentMessageChunk = {
  event: 'agent_message'
  answer: string
}

type MessageEndChunk = {
  event: 'message_end'
  metadata: {
    usage?: {
      total_tokens: number
    }
  }
  conversation_id: string
}

export type Chunk = MessageChunk | AgentMessageChunk | MessageEndChunk
