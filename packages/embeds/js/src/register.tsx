import { customElement } from 'solid-element'
import {
  defaultBotProps,
  defaultBubbleProps,
  defaultPopupProps,
} from './constants'
import { Bubble } from './features/bubble'
import { Popup } from './features/popup'
import { Standard } from './features/standard'

export const registerWebComponents = () => {
  if (typeof window === 'undefined') return
  // @ts-expect-error element incorect type
  customElement('sniper-standard', defaultBotProps, Standard)
  customElement('sniper-bubble', defaultBubbleProps, Bubble)
  customElement('sniper-popup', defaultPopupProps, Popup)
}
