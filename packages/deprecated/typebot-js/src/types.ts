export type IframeParams = {
  url: string
  backgroundColor?: string
  hiddenVariables?: { [key: string]: string | undefined }
  customDomain?: string
  loadWhenVisible?: boolean
} & IframeCallbacks

export type IframeCallbacks = {
  onNewVariableValue?: (v: Variable) => void
}

export type PopupParams = {
  delay?: number
} & IframeParams

export type PopupActions = {
  open: () => void
  close: () => void
}

export type BubbleParams = {
  button?: ButtonParams
  proactiveMessage?: ProactiveMessageParams
  autoOpenDelay?: number
} & IframeParams

export type ButtonParams = {
  color?: string
  iconUrl?: string
  iconStyle?: string
  iconColor?: string
  closeIconColor?: string
}

export type ProactiveMessageParams = {
  avatarUrl?: string
  textContent: string
  delay?: number
  rememberClose?: boolean
}

export type BubbleActions = {
  open: () => void
  close: () => void
  openProactiveMessage?: () => void
}

export type Variable = {
  name: string
  value: string
}

export type TypebotPostMessageData = {
  redirectUrl?: string
  newVariableValue?: Variable
  codeToExecute?: string
  closeChatBubble?: boolean
}

export const localStorageKeys = {
  rememberClose: 'rememberClose',
}
