import {
  Background,
  ChatTheme,
  ContainerTheme,
  GeneralTheme,
  InputTheme,
  Theme,
} from '@sniper.io/schemas'
import { BackgroundType } from '@sniper.io/schemas/features/sniper/theme/constants'

const cssVariableNames = {
  general: {
    bgImage: '--sniper-container-bg-image',
    bgColor: '--sniper-container-bg-color',
    fontFamily: '--sniper-container-font-family',
  },
  chat: {
    hostBubbles: {
      bgColor: '--sniper-host-bubble-bg-color',
      color: '--sniper-host-bubble-color',
    },
    guestBubbles: {
      bgColor: '--sniper-guest-bubble-bg-color',
      color: '--sniper-guest-bubble-color',
    },
    inputs: {
      bgColor: '--sniper-input-bg-color',
      color: '--sniper-input-color',
      placeholderColor: '--sniper-input-placeholder-color',
    },
    buttons: {
      bgColor: '--sniper-button-bg-color',
      color: '--sniper-button-color',
    },
  },
}

export const setCssVariablesValue = (
  theme: Theme | undefined,
  documentStyle: CSSStyleDeclaration
) => {
  if (!theme) return
  if (theme.general) setGeneralTheme(theme.general, documentStyle)
  if (theme.chat) setChatTheme(theme.chat, documentStyle)
}

const setGeneralTheme = (
  generalTheme: GeneralTheme,
  documentStyle: CSSStyleDeclaration
) => {
  const { background, font } = generalTheme
  if (background) setSniperBackground
  if (font && typeof font === 'string')
    documentStyle.setProperty(cssVariableNames.general.fontFamily, font)
}

const setChatTheme = (
  chatTheme: ChatTheme,
  documentStyle: CSSStyleDeclaration
) => {
  const { hostBubbles, guestBubbles, buttons, inputs } = chatTheme
  if (hostBubbles) setHostBubbles(hostBubbles, documentStyle)
  if (guestBubbles) setGuestBubbles(guestBubbles, documentStyle)
  if (buttons) setButtons(buttons, documentStyle)
  if (inputs) setInputs(inputs, documentStyle)
}

const setHostBubbles = (
  hostBubbles: ContainerTheme,
  documentStyle: CSSStyleDeclaration
) => {
  if (hostBubbles.backgroundColor)
    documentStyle.setProperty(
      cssVariableNames.chat.hostBubbles.bgColor,
      hostBubbles.backgroundColor
    )
  if (hostBubbles.color)
    documentStyle.setProperty(
      cssVariableNames.chat.hostBubbles.color,
      hostBubbles.color
    )
}

const setGuestBubbles = (
  guestBubbles: any,
  documentStyle: CSSStyleDeclaration
) => {
  if (guestBubbles.backgroundColor)
    documentStyle.setProperty(
      cssVariableNames.chat.guestBubbles.bgColor,
      guestBubbles.backgroundColor
    )
  if (guestBubbles.color)
    documentStyle.setProperty(
      cssVariableNames.chat.guestBubbles.color,
      guestBubbles.color
    )
}

const setButtons = (
  buttons: ContainerTheme,
  documentStyle: CSSStyleDeclaration
) => {
  if (buttons.backgroundColor)
    documentStyle.setProperty(
      cssVariableNames.chat.buttons.bgColor,
      buttons.backgroundColor
    )
  if (buttons.color)
    documentStyle.setProperty(
      cssVariableNames.chat.buttons.color,
      buttons.color
    )
}

const setInputs = (inputs: InputTheme, documentStyle: CSSStyleDeclaration) => {
  if (inputs.backgroundColor)
    documentStyle.setProperty(
      cssVariableNames.chat.inputs.bgColor,
      inputs.backgroundColor
    )
  if (inputs.color)
    documentStyle.setProperty(cssVariableNames.chat.inputs.color, inputs.color)
  if (inputs.placeholderColor)
    documentStyle.setProperty(
      cssVariableNames.chat.inputs.placeholderColor,
      inputs.placeholderColor
    )
}

const setSniperBackground = (
  background: Background,
  documentStyle: CSSStyleDeclaration
) => {
  documentStyle.setProperty(
    background?.type === BackgroundType.IMAGE
      ? cssVariableNames.general.bgImage
      : cssVariableNames.general.bgColor,
    background.type === BackgroundType.NONE
      ? 'transparent'
      : background.content ?? '#ffffff'
  )
}
