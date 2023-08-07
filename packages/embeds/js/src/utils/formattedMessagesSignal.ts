import { createSignal } from 'solid-js'

export const [formattedMessages, setFormattedMessages] = createSignal<
  { inputId: string; formattedMessage: string }[]
>([])
