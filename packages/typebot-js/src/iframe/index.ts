import { TypebotPostMessageData, IframeCallbacks, IframeParams } from '../types'
import './style.css'

export const createIframe = ({
  backgroundColor,
  url,
  ...iframeParams
}: IframeParams): HTMLIFrameElement => {
  const { loadWhenVisible, hiddenVariables } = iframeParams
  const hostUrlParams = new URLSearchParams(document.location.search)
  const hostQueryObj: { [key: string]: string } = {}
  hostUrlParams.forEach((value, key) => {
    hostQueryObj[key] = value
  })
  const iframeUrl = `${url}${parseQueryParams({
    ...hiddenVariables,
    ...hostQueryObj,
  })}`
  const iframe = document.createElement('iframe')
  iframe.setAttribute(loadWhenVisible ? 'data-src' : 'src', iframeUrl)
  iframe.setAttribute('data-id', url)
  const randomThreeLettersId = Math.random().toString(36).substring(7)
  const uniqueId = `${url}-${randomThreeLettersId}`
  iframe.setAttribute('id', uniqueId)
  if (backgroundColor) iframe.style.backgroundColor = backgroundColor
  iframe.classList.add('typebot-iframe')
  const { onNewVariableValue } = iframeParams
  listenForTypebotMessages({ onNewVariableValue })
  return iframe
}

const parseQueryParams = (starterVariables?: {
  [key: string]: string | undefined
}): string => {
  return parseStarterVariables(starterVariables)
}

const parseStarterVariables = (starterVariables?: {
  [key: string]: string | undefined
}) =>
  starterVariables && Object.keys(starterVariables).length > 0
    ? `?${Object.keys(starterVariables)
        .filter((key) => starterVariables[key])
        .map(
          (key) =>
            `${key}=${encodeURIComponent(starterVariables[key] as string)}`
        )
        .join('&')}`
    : ''

export const listenForTypebotMessages = (callbacks: IframeCallbacks) => {
  window.addEventListener('message', (event) => {
    const data = event.data as { from?: 'typebot' } & TypebotPostMessageData
    if (data.from === 'typebot') processMessage(event.data, callbacks)
  })
}

const processMessage = (
  data: TypebotPostMessageData,
  callbacks: IframeCallbacks
) => {
  if (data.redirectUrl) window.open(data.redirectUrl)
  if (data.newVariableValue && callbacks.onNewVariableValue)
    callbacks.onNewVariableValue(data.newVariableValue)
  if (data.codeToExecute) data.codeToExecute()
}
