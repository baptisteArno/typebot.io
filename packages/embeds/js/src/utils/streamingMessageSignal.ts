import { createSignal } from 'solid-js'

export const [streamingMessage, setStreamingMessage] = createSignal<{
  id: string
  content: string
}>()
