import { BubbleProps } from './features/bubble'
import { PopupProps } from './features/popup'
import { BotProps } from './components/Bot'
import {
  close,
  hidePreviewMessage,
  open,
  setPrefilledVariables,
  showPreviewMessage,
  toggle,
  setInputValue,
  unmount,
} from './features/commands'

export const initStandard = (props: BotProps & { id?: string }) => {
  const standardElement = props.id
    ? document.getElementById(props.id)
    : document.querySelector('sniper-standard')
  if (!standardElement) throw new Error('<sniper-standard> element not found.')
  Object.assign(standardElement, props)
}

export const initPopup = (props: PopupProps) => {
  const popupElement = document.createElement('sniper-popup')
  Object.assign(popupElement, props)
  document.body.prepend(popupElement)
}

export const initBubble = (props: BubbleProps) => {
  const bubbleElement = document.createElement('sniper-bubble')
  Object.assign(bubbleElement, props)
  document.body.prepend(bubbleElement)
}

type Sniper = {
  initStandard: typeof initStandard
  initPopup: typeof initPopup
  initBubble: typeof initBubble
  close: typeof close
  hidePreviewMessage: typeof hidePreviewMessage
  open: typeof open
  setPrefilledVariables: typeof setPrefilledVariables
  showPreviewMessage: typeof showPreviewMessage
  toggle: typeof toggle
  setInputValue: typeof setInputValue
  unmount: typeof unmount
}

declare const window:
  | {
      Sniper: Sniper | undefined
    }
  | undefined

export const parseSniper = () => ({
  initStandard,
  initPopup,
  initBubble,
  close,
  hidePreviewMessage,
  open,
  setPrefilledVariables,
  showPreviewMessage,
  toggle,
  setInputValue,
  unmount,
})

export const injectSniperInWindow = (sniper: Sniper) => {
  if (typeof window === 'undefined') return
  window.Sniper = { ...sniper }
}
