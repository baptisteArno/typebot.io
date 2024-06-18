import { closeIframe } from '../embedTypes/chat/iframe'
import { closePopup } from '../embedTypes/popup'

export const close = () => {
  const existingPopup = document.querySelector('#sniper-popup')
  if (existingPopup) closePopup(existingPopup)
  const existingBubble = document.querySelector('#sniper-bubble')
  if (existingBubble) closeIframe(existingBubble)
}
