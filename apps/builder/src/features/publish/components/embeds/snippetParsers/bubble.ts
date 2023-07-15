import { BubbleProps } from '@typebot.io/nextjs'
import parserBabel from 'prettier/parser-babel'
import prettier from 'prettier/standalone'
import {
  parseStringParam,
  parseBotProps,
  parseNumberOrBoolParam,
  parseReactBotProps,
} from './shared'

const parseButtonTheme = (
  button: NonNullable<BubbleProps['theme']>['button']
): string => {
  if (!button) return ''
  const { backgroundColor, iconColor, customIconSrc } = button
  const backgroundColorLine = parseStringParam(
    'backgroundColor',
    backgroundColor
  )
  const iconColorLine = parseStringParam('iconColor', iconColor)
  const customIconLine = parseStringParam('customIconSrc', customIconSrc)
  const sizeLine = parseStringParam('size', button.size)
  const line = `button: {${backgroundColorLine}${iconColorLine}${customIconLine}${sizeLine}},`
  if (line === 'button: {},') return ''
  return line
}

const parsePreviewMessageTheme = (
  previewMessage: NonNullable<BubbleProps['theme']>['previewMessage']
): string => {
  if (!previewMessage) return ''
  const {
    backgroundColor,
    closeButtonBackgroundColor,
    closeButtonIconColor,
    textColor,
  } = previewMessage
  const backgroundColorLine = parseStringParam(
    'backgroundColor',
    backgroundColor
  )
  const closeButtonBackgroundColorLine = parseStringParam(
    'closeButtonBackgroundColor',
    closeButtonBackgroundColor
  )
  const closeButtonIconColorLine = parseStringParam(
    'closeButtonIconColor',
    closeButtonIconColor
  )
  const textColorLine = parseStringParam('textColor', textColor)
  const line = `previewMessage: {${backgroundColorLine}${textColorLine}${closeButtonBackgroundColorLine}${closeButtonIconColorLine}},`
  if (line === 'previewMessage: {},') return ''
  return line
}

const parseChatWindowTheme = (
  chatWindow: NonNullable<BubbleProps['theme']>['chatWindow']
) => {
  if (!chatWindow) return ''
  const backgroundColorLine = parseStringParam(
    'backgroundColor',
    chatWindow.backgroundColor
  )
  const line = `chatWindow: {${backgroundColorLine}},`
  if (line === 'chatWindow: {},') return ''
  return line
}

const parseBubbleTheme = (theme: BubbleProps['theme']): string => {
  if (!theme) return ''
  const { button, previewMessage } = theme
  const buttonThemeLine = parseButtonTheme(button)
  const previewMessageThemeLine = parsePreviewMessageTheme(previewMessage)
  const chatWindowThemeLine = parseChatWindowTheme(theme.chatWindow)
  const placementLine = parseStringParam('placement', theme.placement, 'right')
  const line = `theme: {${placementLine}${buttonThemeLine}${previewMessageThemeLine}${chatWindowThemeLine}},`
  if (line === 'theme: {},') return ''
  return line
}

const parsePreviewMessage = (
  previewMessage: BubbleProps['previewMessage']
): string => {
  if (!previewMessage) return ''
  const { message, autoShowDelay, avatarUrl } = previewMessage
  const messageLine = parseStringParam('message', message)
  const autoShowDelayLine = parseNumberOrBoolParam(
    'autoShowDelay',
    autoShowDelay
  )
  const avatarUrlLine = parseStringParam('avatarUrl', avatarUrl)
  const line = `previewMessage: {${messageLine}${autoShowDelayLine}${avatarUrlLine}},`
  if (line === 'previewMessage: {},') return ''
  return line
}

const parseBubbleProps = ({
  previewMessage,
  theme,
}: Pick<BubbleProps, 'previewMessage' | 'theme'>) => {
  const previewMessageLine = parsePreviewMessage(previewMessage)
  const themeLine = parseBubbleTheme(theme)
  return `${previewMessageLine}${themeLine}`
}

export const parseInitBubbleCode = ({
  typebot,
  apiHost,
  previewMessage,
  theme,
}: BubbleProps) => {
  const botProps = parseBotProps({ typebot, apiHost })
  const bubbleProps = parseBubbleProps({ previewMessage, theme })

  return prettier.format(`Typebot.initBubble({${botProps}${bubbleProps}});`, {
    parser: 'babel',
    plugins: [parserBabel],
  })
}

const parseReactBubbleTheme = (theme: BubbleProps['theme']): string => {
  if (!theme) return ''
  const { button, previewMessage } = theme
  const buttonThemeLine = parseButtonTheme(button)
  const previewMessageThemeLine = parsePreviewMessageTheme(previewMessage)
  const line = `theme={{${buttonThemeLine}${previewMessageThemeLine}}}`
  if (line === 'theme={{}}') return ''
  return line
}

const parseReactPreviewMessage = (
  previewMessage: BubbleProps['previewMessage']
): string => {
  if (!previewMessage) return ''
  const { message, autoShowDelay, avatarUrl } = previewMessage
  const messageLine = parseStringParam('message', message)
  const autoShowDelayLine = parseNumberOrBoolParam(
    'autoShowDelay',
    autoShowDelay
  )
  const avatarUrlLine = parseStringParam('avatarUrl', avatarUrl)
  const line = `previewMessage={{${messageLine}${autoShowDelayLine}${avatarUrlLine}}}`
  if (line === 'previewMessage={{}}') return ''
  return line
}

export const parseReactBubbleProps = ({
  typebot,
  apiHost,
  previewMessage,
  theme,
}: BubbleProps) => {
  const botProps = parseReactBotProps({ typebot, apiHost })
  const previewMessageProp = parseReactPreviewMessage(previewMessage)
  const themeProp = parseReactBubbleTheme(theme)

  return `${botProps} ${previewMessageProp} ${themeProp}`
}
