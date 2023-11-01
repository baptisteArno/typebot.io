import { createSignal } from 'solid-js'

export const [formattedMessages, setFormattedMessages] = createSignal<
  { inputIndex: number; formattedMessage: string }[]
>([])
