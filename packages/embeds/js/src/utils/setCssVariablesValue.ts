import {
  Background,
  ChatTheme,
  ContainerColors,
  GeneralTheme,
  InputColors,
  Theme,
} from '@typebot.io/schemas'
import { isLight, hexToRgb } from '@typebot.io/lib/hexToRgb'
import { isNotEmpty } from '@typebot.io/lib'
import {
  BackgroundType,
  defaultTheme,
} from '@typebot.io/schemas/features/typebot/theme/constants'

const cssVariableNames = {
  general: {
    bgImage: '--typebot-container-bg-image',
    bgColor: '--typebot-container-bg-color',
    fontFamily: '--typebot-container-font-family',
    color: '--typebot-container-color',
    progressBar: {
      position: '--typebot-progress-bar-position',
      color: '--typebot-progress-bar-color',
      colorRgb: '--typebot-progress-bar-color-rgb',
      height: '--typebot-progress-bar-height',
      top: '--typebot-progress-bar-top',
      bottom: '--typebot-progress-bar-bottom',
    },
  },
  chat: {
    hostBubbles: {
      bgColor: '--typebot-host-bubble-bg-color',
      color: '--typebot-host-bubble-color',
    },
    guestBubbles: {
      bgColor: '--typebot-guest-bubble-bg-color',
      color: '--typebot-guest-bubble-color',
    },
    inputs: {
      bgColor: '--typebot-input-bg-color',
      color: '--typebot-input-color',
      placeholderColor: '--typebot-input-placeholder-color',
    },
    buttons: {
      bgColor: '--typebot-button-bg-color',
      bgColorRgb: '--typebot-button-bg-color-rgb',
      color: '--typebot-button-color',
    },
    checkbox: {
      bgColor: '--typebot-checkbox-bg-color',
      color: '--typebot-checkbox-color',
      baseAlpha: '--selectable-base-alpha',
    },
  },
} as const

export const setCssVariablesValue = (
  theme: Theme | undefined,
  container: HTMLDivElement,
  isPreview?: boolean
) => {
  if (!theme) return
  const documentStyle = container?.style
  if (!documentStyle) return
  setGeneralTheme(
    theme.general ?? defaultTheme.general,
    documentStyle,
    isPreview
  )
  setChatTheme(theme.chat ?? defaultTheme.chat, documentStyle)
}

const setGeneralTheme = (
  generalTheme: GeneralTheme,
  documentStyle: CSSStyleDeclaration,
  isPreview?: boolean
) => {
  setTypebotBackground(
    generalTheme.background ?? defaultTheme.general.background,
    documentStyle
  )
  documentStyle.setProperty(
    cssVariableNames.general.fontFamily,
    (typeof generalTheme.font === 'string'
      ? generalTheme.font
      : generalTheme.font?.family) ?? defaultTheme.general.font.family
  )
  setProgressBar(
    generalTheme.progressBar ?? defaultTheme.general.progressBar,
    documentStyle,
    isPreview
  )
}

const setProgressBar = (
  progressBar: NonNullable<GeneralTheme['progressBar']>,
  documentStyle: CSSStyleDeclaration,
  isPreview?: boolean
) => {
  const position =
    progressBar.position ?? defaultTheme.general.progressBar.position

  documentStyle.setProperty(
    cssVariableNames.general.progressBar.position,
    position === 'fixed' ? (isPreview ? 'absolute' : 'fixed') : position
  )
  documentStyle.setProperty(
    cssVariableNames.general.progressBar.color,
    progressBar.color ?? defaultTheme.general.progressBar.color
  )
  documentStyle.setProperty(
    cssVariableNames.general.progressBar.colorRgb,
    hexToRgb(
      progressBar.backgroundColor ??
        defaultTheme.general.progressBar.backgroundColor
    ).join(', ')
  )
  documentStyle.setProperty(
    cssVariableNames.general.progressBar.height,
    `${progressBar.thickness ?? defaultTheme.general.progressBar.thickness}px`
  )

  const placement =
    progressBar.placement ?? defaultTheme.general.progressBar.placement

  documentStyle.setProperty(
    cssVariableNames.general.progressBar.top,
    placement === 'Top' ? '0' : 'auto'
  )

  documentStyle.setProperty(
    cssVariableNames.general.progressBar.bottom,
    placement === 'Bottom' ? '0' : 'auto'
  )
}

const setChatTheme = (
  chatTheme: ChatTheme,
  documentStyle: CSSStyleDeclaration
) => {
  setHostBubbles(
    chatTheme.hostBubbles ?? defaultTheme.chat.hostBubbles,
    documentStyle
  )
  setGuestBubbles(
    chatTheme.guestBubbles ?? defaultTheme.chat.guestBubbles,
    documentStyle
  )
  setButtons(chatTheme.buttons ?? defaultTheme.chat.buttons, documentStyle)
  setInputs(chatTheme.inputs ?? defaultTheme.chat.inputs, documentStyle)
  setRoundness(
    chatTheme.roundness ?? defaultTheme.chat.roundness,
    documentStyle
  )
}

const setHostBubbles = (
  hostBubbles: ContainerColors,
  documentStyle: CSSStyleDeclaration
) => {
  documentStyle.setProperty(
    cssVariableNames.chat.hostBubbles.bgColor,
    hostBubbles.backgroundColor ?? defaultTheme.chat.hostBubbles.backgroundColor
  )
  documentStyle.setProperty(
    cssVariableNames.chat.hostBubbles.color,
    hostBubbles.color ?? defaultTheme.chat.hostBubbles.color
  )
}

const setGuestBubbles = (
  guestBubbles: ContainerColors,
  documentStyle: CSSStyleDeclaration
) => {
  documentStyle.setProperty(
    cssVariableNames.chat.guestBubbles.bgColor,
    guestBubbles.backgroundColor ??
      defaultTheme.chat.guestBubbles.backgroundColor
  )
  documentStyle.setProperty(
    cssVariableNames.chat.guestBubbles.color,
    guestBubbles.color ?? defaultTheme.chat.guestBubbles.color
  )
}

const setButtons = (
  buttons: ContainerColors,
  documentStyle: CSSStyleDeclaration
) => {
  const bgColor =
    buttons.backgroundColor ?? defaultTheme.chat.buttons.backgroundColor
  documentStyle.setProperty(cssVariableNames.chat.buttons.bgColor, bgColor)
  documentStyle.setProperty(
    cssVariableNames.chat.buttons.bgColorRgb,
    hexToRgb(bgColor).join(', ')
  )

  documentStyle.setProperty(
    cssVariableNames.chat.buttons.color,
    buttons.color ?? defaultTheme.chat.buttons.color
  )
}

const setInputs = (inputs: InputColors, documentStyle: CSSStyleDeclaration) => {
  documentStyle.setProperty(
    cssVariableNames.chat.inputs.bgColor,
    inputs.backgroundColor ?? defaultTheme.chat.inputs.backgroundColor
  )
  documentStyle.setProperty(
    cssVariableNames.chat.inputs.color,
    inputs.color ?? defaultTheme.chat.inputs.color
  )
  documentStyle.setProperty(
    cssVariableNames.chat.inputs.placeholderColor,
    inputs.placeholderColor ?? defaultTheme.chat.inputs.placeholderColor
  )
}

const setTypebotBackground = (
  background: Background,
  documentStyle: CSSStyleDeclaration
) => {
  documentStyle.setProperty(cssVariableNames.general.bgImage, null)
  documentStyle.setProperty(cssVariableNames.general.bgColor, null)
  documentStyle.setProperty(
    background?.type === BackgroundType.IMAGE
      ? cssVariableNames.general.bgImage
      : cssVariableNames.general.bgColor,
    parseBackgroundValue(background)
  )
  documentStyle.setProperty(
    cssVariableNames.chat.checkbox.bgColor,
    background?.type === BackgroundType.IMAGE
      ? 'rgba(255, 255, 255, 0.75)'
      : (background?.type === BackgroundType.COLOR
          ? background.content
          : '#ffffff') ?? '#ffffff'
  )
  const backgroundColor =
    background.type === BackgroundType.IMAGE
      ? '#000000'
      : background?.type === BackgroundType.COLOR &&
        isNotEmpty(background.content)
      ? background.content
      : '#ffffff'
  documentStyle.setProperty(
    cssVariableNames.general.color,
    isLight(backgroundColor) ? '#303235' : '#ffffff'
  )
  if (background.type === BackgroundType.IMAGE) {
    documentStyle.setProperty(cssVariableNames.chat.checkbox.baseAlpha, '0.40')
  } else {
    documentStyle.setProperty(cssVariableNames.chat.checkbox.baseAlpha, '0')
  }
}

const parseBackgroundValue = ({ type, content }: Background = {}) => {
  switch (type) {
    case BackgroundType.NONE:
      return 'transparent'
    case undefined:
    case BackgroundType.COLOR:
      return content ?? defaultTheme.general.background.content
    case BackgroundType.IMAGE:
      return `url(${content})`
  }
}

const setRoundness = (
  roundness: NonNullable<ChatTheme['roundness']>,
  documentStyle: CSSStyleDeclaration
) => {
  switch (roundness) {
    case 'none':
      documentStyle.setProperty('--typebot-border-radius', '0')
      break
    case 'medium':
      documentStyle.setProperty('--typebot-border-radius', '6px')
      break
    case 'large':
      documentStyle.setProperty('--typebot-border-radius', '20px')
      break
  }
}
