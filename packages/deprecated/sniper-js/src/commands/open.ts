import { openIframe } from '../embedTypes/chat/iframe'
import { openPopup } from '../embedTypes/popup'

export const open = () => {
  const existingPopup = document.querySelector('#sniper-popup')
  if (existingPopup) openPopup(existingPopup)
  const existingBubble = document.querySelector('#sniper-bubble')
  if (existingBubble) openIframe(existingBubble)
}
