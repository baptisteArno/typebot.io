/* eslint-disable solid/reactivity */
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
} from './features/commands'

export const initStandard = (props: BotProps & { id?: string }) => {
  const standardElement = props.id
    ? document.getElementById(props.id)
    : document.querySelector('typebot-standard')
  if (!standardElement) throw new Error('<typebot-standard> element not found.')
  Object.assign(standardElement, props)
}

export const initPopup = (props: PopupProps) => {
  const popupElement = document.createElement('typebot-popup')
  Object.assign(popupElement, props)
  document.body.appendChild(popupElement)
}

export const initBubble = (props: BubbleProps) => {
  const bubbleElement = document.createElement('typebot-bubble')
  Object.assign(bubbleElement, props)
  document.body.appendChild(bubbleElement)
}

type Typebot = {
  initStandard: typeof initStandard
  initPopup: typeof initPopup
  initBubble: typeof initBubble
  close: typeof close
  hidePreviewMessage: typeof hidePreviewMessage
  open: typeof open
  setPrefilledVariables: typeof setPrefilledVariables
  showPreviewMessage: typeof showPreviewMessage
  toggle: typeof toggle
}

declare const window:
  | {
      Typebot: Typebot | undefined
    }
  | undefined

export const parseTypebot = () => ({
  initStandard,
  initPopup,
  initBubble,
  close,
  hidePreviewMessage,
  open,
  setPrefilledVariables,
  showPreviewMessage,
  toggle,
})

export const injectTypebotInWindow = (typebot: Typebot) => {
  if (typeof window === 'undefined') return
  window.Typebot = { ...typebot }
}
