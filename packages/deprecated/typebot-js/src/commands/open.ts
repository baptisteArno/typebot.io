import { openIframe } from '../embedTypes/chat/iframe'
import { openPopup } from '../embedTypes/popup'

export const open = () => {
  const existingPopup = document.querySelector('#typebot-popup')
  if (existingPopup) openPopup(existingPopup)
  const existingBubble = document.querySelector('#typebot-bubble')
  if (existingBubble) openIframe(existingBubble)
}
