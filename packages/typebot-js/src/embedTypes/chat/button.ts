import { ButtonParams } from '../../types'

export const createButton = (params?: ButtonParams): HTMLButtonElement => {
  const button = document.createElement('button')
  button.id = 'typebot-bubble-button'
  button.style.backgroundColor = params?.color ?? '#0042DA'
  button.appendChild(createButtonIcon(params?.iconUrl, params?.iconStyle))
  button.appendChild(createCloseIcon())
  return button
}

const createButtonIcon = (
  src?: string,
  style?: string
): SVGElement | HTMLImageElement => {
  if (!src) return createDefaultIcon()
  const icon = document.createElement('img')
  icon.classList.add('icon')
  icon.src = src
  if (style) icon.setAttribute('style', style)
  return icon
}

const createDefaultIcon = (): SVGElement => {
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  icon.setAttribute('viewBox', '0 0 41 19')
  icon.style.width = '63%'
  icon.innerHTML = typebotLogoSvgTextContent()
  icon.classList.add('icon')
  return icon
}

const createCloseIcon = (): SVGElement => {
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  icon.setAttribute('viewBox', '0 0 512 512')
  icon.innerHTML = closeSvgPath
  icon.classList.add('close-icon')
  return icon
}

const typebotLogoSvgTextContent = () =>
  `<rect x="40.29" y="0.967773" width="6.83761" height="30.7692" rx="3.4188" transform="rotate(90 40.29 0.967773)"></rect> <path fill-rule="evenodd" clip-rule="evenodd" d="M3.70884 7.80538C5.597 7.80538 7.12765 6.27473 7.12765 4.38658C7.12765 2.49842 5.597 0.967773 3.70884 0.967773C1.82069 0.967773 0.290039 2.49842 0.290039 4.38658C0.290039 6.27473 1.82069 7.80538 3.70884 7.80538Z" fill="white"></path> <rect x="0.290039" y="18.0615" width="6.83761" height="30.7692" rx="3.4188" transform="rotate(-90 0.290039 18.0615)" fill="white"></rect> <path fill-rule="evenodd" clip-rule="evenodd" d="M36.8712 11.2239C34.9831 11.2239 33.4524 12.7546 33.4524 14.6427C33.4524 16.5309 34.9831 18.0615 36.8712 18.0615C38.7594 18.0615 40.29 16.5309 40.29 14.6427C40.29 12.7546 38.7594 11.2239 36.8712 11.2239Z" fill="white"></path>`

export const closeSvgPath = `<path d="M278.6 256l68.2-68.2c6.2-6.2 6.2-16.4 0-22.6-6.2-6.2-16.4-6.2-22.6 0L256 233.4l-68.2-68.2c-6.2-6.2-16.4-6.2-22.6 0-3.1 3.1-4.7 7.2-4.7 11.3 0 4.1 1.6 8.2 4.7 11.3l68.2 68.2-68.2 68.2c-3.1 3.1-4.7 7.2-4.7 11.3 0 4.1 1.6 8.2 4.7 11.3 6.2 6.2 16.4 6.2 22.6 0l68.2-68.2 68.2 68.2c6.2 6.2 16.4 6.2 22.6 0 6.2-6.2 6.2-16.4 0-22.6L278.6 256z"></path>`
