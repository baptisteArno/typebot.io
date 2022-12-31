import { IframeParams } from '../types'

export const setHiddenVariables = (
  hiddenVariables: IframeParams['hiddenVariables']
) => {
  const existingIframe = document.querySelector('.typebot-iframe') as
    | HTMLIFrameElement
    | undefined
  if (!existingIframe) return
  const hostUrlParams = new URLSearchParams(document.location.search)
  const hostQueryObj: { [key: string]: string } = {}
  hostUrlParams.forEach((value, key) => {
    hostQueryObj[key] = value
  })
  const isLoadWhenVisible = existingIframe.hasAttribute('data-src')
  const url = (
    existingIframe.getAttribute('data-src') || existingIframe.src
  ).split('?')[0]
  const iframeUrl = `${url}${parseQueryParams({
    ...hiddenVariables,
    ...hostQueryObj,
  })}`
  existingIframe.setAttribute(isLoadWhenVisible ? 'data-src' : 'src', iframeUrl)
}

export const parseQueryParams = (starterVariables?: {
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
