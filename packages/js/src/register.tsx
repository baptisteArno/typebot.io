import { customElement } from 'solid-element'
import { Bot, BotProps } from './components/Bot'
import { Bubble, BubbleProps } from './features/bubble'
import { Popup, PopupProps } from './features/popup'

export const registerStandardComponent = (props: BotProps) => {
  if (typeof window === 'undefined') return
  customElement('typebot-standard', props, Bot)
}

export const registerBubbleComponent = (props: BubbleProps) => {
  if (typeof window === 'undefined') return
  customElement('typebot-bubble', props, Bubble)
}

export const registerPopupComponent = (props: PopupProps) => {
  if (typeof window === 'undefined') return
  customElement('typebot-popup', props, Popup)
}
