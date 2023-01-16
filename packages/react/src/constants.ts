import type { BotProps, PopupProps, BubbleProps } from '@typebot.io/js'

export const defaultBotProps: BotProps = {
  typebot: '',
  onNewInputBlock: undefined,
  onAnswer: undefined,
  onEnd: undefined,
  onInit: undefined,
  isPreview: undefined,
  startGroupId: undefined,
  prefilledVariables: undefined,
  apiHost: undefined,
  resultId: undefined,
}

export const defaultPopupProps: PopupProps = {
  ...defaultBotProps,
  onClose: undefined,
  onOpen: undefined,
  theme: undefined,
  autoShowDelay: undefined,
  isOpen: undefined,
  defaultOpen: undefined,
}

export const defaultBubbleProps: BubbleProps = {
  ...defaultBotProps,
  onClose: undefined,
  onOpen: undefined,
  theme: undefined,
  previewMessage: undefined,
}
