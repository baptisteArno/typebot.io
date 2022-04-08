import { DataFromTypebot, IframeCallbacks, IframeParams } from '../types'
import './style.css'

export const createIframe = ({
  backgroundColor,
  url,
  ...iframeParams
}: IframeParams): HTMLIFrameElement => {
  const { loadWhenVisible, hiddenVariables } = iframeParams
  const iframeUrl = `${url}${parseQueryParams(hiddenVariables)}`
  const iframe = document.createElement('iframe')
  iframe.setAttribute(loadWhenVisible ? 'data-src' : 'src', iframeUrl)
  iframe.setAttribute('data-id', url)
  const randomThreeLettersId = Math.random().toString(36).substring(7)
  const uniqueId = `${url}-${randomThreeLettersId}`
  iframe.setAttribute('id', uniqueId)
  if (backgroundColor) iframe.style.backgroundColor = backgroundColor
  iframe.classList.add('typebot-iframe')
  const { onNewVariableValue, onVideoPlayed } = iframeParams
  listenForTypebotMessages({ onNewVariableValue, onVideoPlayed })
  iframe.style.display = 'none'
  return iframe
}

const parseQueryParams = (starterVariables?: {
  [key: string]: string | undefined
}): string => {
  return parseHostnameQueryParam() + parseStarterVariables(starterVariables)
}

const parseHostnameQueryParam = () => {
  return `?hn=${window.location.hostname}`
}

const parseStarterVariables = (starterVariables?: {
  [key: string]: string | undefined
}) =>
  starterVariables
    ? `&${Object.keys(starterVariables)
        .filter((key) => starterVariables[key])
        .map(
          (key) =>
            `${key}=${encodeURIComponent(starterVariables[key] as string)}`
        )
        .join('&')}`
    : ''

export const listenForTypebotMessages = (callbacks: IframeCallbacks) => {
  window.addEventListener('message', (event) => {
    const data = event.data as { from?: 'typebot' } & DataFromTypebot
    if (data.from === 'typebot') processMessage(event.data, callbacks)
  })
}

const processMessage = (data: DataFromTypebot, callbacks: IframeCallbacks) => {
  if (data.redirectUrl) window.open(data.redirectUrl)
  if (data.newVariableValue && callbacks.onNewVariableValue)
    callbacks.onNewVariableValue(data.newVariableValue)
  if (data.videoPlayed && callbacks.onVideoPlayed) callbacks.onVideoPlayed()
}
