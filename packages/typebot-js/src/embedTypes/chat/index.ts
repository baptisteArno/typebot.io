import {
  BubbleActions,
  BubbleParams,
  localStorageKeys,
  ProactiveMessageParams,
} from '../../types'
import { createButton } from './button'
import {
  closeIframe,
  createIframeContainer,
  loadTypebotIfFirstOpen,
  openIframe,
} from './iframe'
import {
  createProactiveMessage,
  openProactiveMessage,
} from './proactiveMessage'
import './style.css'

export const initBubble = (params: BubbleParams): BubbleActions => {
  if (document.readyState !== 'complete') {
    window.addEventListener('load', () => initBubble(params))
    return { close: () => {}, open: () => {} }
  }
  const existingBubble = document.getElementById('typebot-bubble') as
    | HTMLDivElement
    | undefined
  if (existingBubble) existingBubble.remove()
  const { bubbleElement, proactiveMessageElement, iframeElement } =
    createBubble(params)
  if (
    (params.autoOpenDelay || params.autoOpenDelay === 0) &&
    !hasBeenClosed()
  ) {
    setRememberCloseInStorage()
    setTimeout(
      () => openIframe(bubbleElement, iframeElement),
      params.autoOpenDelay
    )
  }
  !document.body
    ? (window.onload = () => document.body.appendChild(bubbleElement))
    : document.body.appendChild(bubbleElement)
  return getBubbleActions(bubbleElement, iframeElement, proactiveMessageElement)
}

const createBubble = (
  params: BubbleParams
): {
  bubbleElement: HTMLDivElement
  iframeElement: HTMLIFrameElement
  proactiveMessageElement?: HTMLDivElement
} => {
  const bubbleElement = document.createElement('div')
  bubbleElement.id = 'typebot-bubble'
  const buttonElement = createButton(params.button)
  bubbleElement.appendChild(buttonElement)
  const proactiveMessageElement =
    params.proactiveMessage && !hasBeenClosed()
      ? addProactiveMessage(params.proactiveMessage, bubbleElement)
      : undefined
  const iframeElement = createIframeContainer(params)
  buttonElement.addEventListener('click', () => {
    iframeElement.style.display === 'none'
      ? openIframe(bubbleElement, iframeElement)
      : closeIframe(bubbleElement, iframeElement)
  })
  if (proactiveMessageElement)
    proactiveMessageElement.addEventListener('click', () =>
      onProactiveMessageClick(bubbleElement, iframeElement)
    )
  bubbleElement.appendChild(iframeElement)
  return { bubbleElement, proactiveMessageElement, iframeElement }
}

const onProactiveMessageClick = (
  bubble: HTMLDivElement,
  iframe: HTMLIFrameElement
): void => {
  loadTypebotIfFirstOpen(iframe)
  bubble.classList.add('iframe-opened')
  bubble.classList.remove('message-opened')
}

export const getBubbleActions = (
  bubbleElement?: HTMLDivElement,
  iframeElement?: HTMLIFrameElement,
  proactiveMessageElement?: HTMLDivElement
): BubbleActions => {
  const existingBubbleElement =
    bubbleElement ??
    (document.querySelector('#typebot-bubble') as HTMLDivElement)
  const existingIframeElement =
    iframeElement ??
    (existingBubbleElement.querySelector(
      '.typebot-iframe'
    ) as HTMLIFrameElement)
  const existingProactiveMessage =
    proactiveMessageElement ??
    document.querySelector('#typebot-bubble .proactive-message')
  return {
    openProactiveMessage: existingProactiveMessage
      ? () => {
          openProactiveMessage(existingBubbleElement)
        }
      : undefined,
    open: () => {
      openIframe(existingBubbleElement, existingIframeElement)
    },
    close: () => {
      closeIframe(existingBubbleElement, existingIframeElement)
    },
  }
}

const addProactiveMessage = (
  proactiveMessage: ProactiveMessageParams,
  bubbleElement: HTMLDivElement
) => {
  const proactiveMessageElement = createProactiveMessage(
    proactiveMessage,
    bubbleElement
  )
  bubbleElement.appendChild(proactiveMessageElement)
  return proactiveMessageElement
}

const hasBeenClosed = () => {
  const closeDecisionFromStorage = localStorage.getItem(
    localStorageKeys.rememberClose
  )
  return closeDecisionFromStorage ? true : false
}

export const setRememberCloseInStorage = () =>
  localStorage.setItem(localStorageKeys.rememberClose, 'true')
