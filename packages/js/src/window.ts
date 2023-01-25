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

export const initStandard = (
  props: BotProps & { style?: string; class?: string }
) => {
  const standardElement = document.querySelector('typebot-standard')
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

declare const window:
  | {
      Typebot:
        | {
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
        | undefined
    }
  | undefined

export const injectTypebotInWindow = () => {
  if (typeof window === 'undefined') return

  window.Typebot = {
    initStandard,
    initPopup,
    initBubble,
    close,
    hidePreviewMessage,
    open,
    setPrefilledVariables,
    showPreviewMessage,
    toggle,
  }
}
