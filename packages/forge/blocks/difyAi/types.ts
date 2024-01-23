export type DifyResponse = {
  answer: string
  metadata: {
    usage: {
      total_tokens: number
    }
  }
  conversation_id: string
}
