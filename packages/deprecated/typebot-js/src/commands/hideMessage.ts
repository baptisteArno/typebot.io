import { closeProactiveMessage } from '../embedTypes/chat/proactiveMessage'

export const hideMessage = () => {
  const existingBubble = document.querySelector('#typebot-bubble')
  if (existingBubble) closeProactiveMessage(existingBubble)
}
