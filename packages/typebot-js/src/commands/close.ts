import { closeIframe } from '../embedTypes/chat/iframe'
import { closePopup } from '../embedTypes/popup'

export const close = () => {
  const existingPopup = document.querySelector('#typebot-popup')
  if (existingPopup) closePopup(existingPopup)
  const existingBubble = document.querySelector('#typebot-bubble')
  if (existingBubble) closeIframe(existingBubble)
}
