import { setRememberCloseInStorage } from '.'
import { ProactiveMessageParams } from '../../types'
import { closeSvgPath } from './button'

const createProactiveMessage = (
  params: ProactiveMessageParams,
  bubble: HTMLDivElement
): HTMLDivElement => {
  const container = document.createElement('div')
  container.classList.add('proactive-message')
  if (params.delay !== undefined) setOpenTimeout(bubble, params)
  if (params.avatarUrl) container.appendChild(createAvatar(params.avatarUrl))
  container.appendChild(createTextElement(params.textContent))
  container.appendChild(createCloseButton(bubble))
  return container
}

const setOpenTimeout = (
  bubble: HTMLDivElement,
  params: ProactiveMessageParams
) => {
  setTimeout(() => {
    openProactiveMessage(bubble)
  }, params.delay)
}

const createAvatar = (avatarUrl: string): HTMLImageElement => {
  const element = document.createElement('img')
  element.src = avatarUrl
  return element
}

const createTextElement = (text: string): HTMLParagraphElement => {
  const element = document.createElement('p')
  element.innerHTML = text
  return element
}

const createCloseButton = (bubble: HTMLDivElement): HTMLButtonElement => {
  const button = document.createElement('button')
  button.classList.add('close-button')
  button.innerHTML = `<svg viewBox="0 0 24 24" style="stroke:black; stroke-width:2px; margin:4px">${closeSvgPath}</svg>`
  button.addEventListener('click', (e) => onCloseButtonClick(e, bubble))
  return button
}

const openProactiveMessage = (bubble: Element): void => {
  bubble.classList.add('message-opened')
}

const onCloseButtonClick = (
  e: Event,
  proactiveMessageElement: HTMLDivElement
) => {
  e.stopPropagation()
  closeProactiveMessage(proactiveMessageElement)
}

const closeProactiveMessage = (bubble: Element): void => {
  setRememberCloseInStorage()
  bubble.classList.remove('message-opened')
}

export { createProactiveMessage, openProactiveMessage, closeProactiveMessage }
