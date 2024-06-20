import { closeProactiveMessage } from '../embedTypes/chat/proactiveMessage'

export const hideMessage = () => {
  const existingBubble = document.querySelector('#sniper-bubble')
  if (existingBubble) closeProactiveMessage(existingBubble)
}
