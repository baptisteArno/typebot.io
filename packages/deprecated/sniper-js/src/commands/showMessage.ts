import { openProactiveMessage } from '../embedTypes/chat/proactiveMessage'

export const showMessage = () => {
  const existingBubble = document.querySelector('#sniper-bubble')
  if (existingBubble) openProactiveMessage(existingBubble)
}
