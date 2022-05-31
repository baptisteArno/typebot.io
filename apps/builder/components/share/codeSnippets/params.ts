import {
  BubbleParams,
  ButtonParams,
  IframeParams,
  PopupParams,
  ProactiveMessageParams,
} from 'typebot-js'
import parserBabel from 'prettier/parser-babel'
import prettier from 'prettier/standalone'
import { isDefined } from 'utils'

const parseStringParam = (fieldName: string, fieldValue?: string) =>
  fieldValue ? `${fieldName}: "${fieldValue}",` : ``

const parseNonStringParam = (
  fieldName: string,
  fieldValue?: number | boolean
) => (isDefined(fieldValue) ? `${fieldName}: ${fieldValue},` : ``)

const parseCustomDomain = (domain?: string): string =>
  parseStringParam('customDomain', domain)

const parseHiddenVariables = (
  variables: { [key: string]: string | undefined } | undefined
): string => (variables ? `hiddenVariables: ${JSON.stringify(variables)},` : ``)

const parseBackgroundColor = (bgColor?: string): string =>
  parseStringParam('backgroundColor', bgColor)

const parseDelay = (delay?: number) => parseNonStringParam('delay', delay)

const parseButton = (button?: ButtonParams): string => {
  if (!button) return ''
  const iconUrlString = parseStringParam('iconUrl', button.iconUrl)
  const buttonColorstring = parseStringParam('color', button.color)
  const buttonIconColorString = parseStringParam('iconColor', button.iconColor)
  return `button: {${iconUrlString}${buttonColorstring}${buttonIconColorString}},`
}

const parseProactiveMessage = (
  proactiveMessage?: ProactiveMessageParams
): string => {
  if (!proactiveMessage) return ``
  const { avatarUrl, textContent, delay } = proactiveMessage
  const avatarUrlString = parseStringParam('avatarUrl', avatarUrl)
  const textContentString = parseStringParam('textContent', textContent)
  const delayString = parseNonStringParam('delay', delay)
  return `proactiveMessage: {${avatarUrlString}${textContentString}${delayString}},`
}

const parseIframeParams = ({
  customDomain,
  hiddenVariables,
  backgroundColor,
}: Pick<
  IframeParams,
  'customDomain' | 'hiddenVariables' | 'backgroundColor'
>) => ({
  customDomainString: parseCustomDomain(customDomain),
  hiddenVariablesString: parseHiddenVariables(hiddenVariables),
  bgColorString: parseBackgroundColor(backgroundColor),
})

const parsePopupParams = ({ delay }: Pick<PopupParams, 'delay'>) => ({
  delayString: parseDelay(delay),
})

const parseBubbleParams = ({
  button,
  proactiveMessage,
}: Pick<BubbleParams, 'button' | 'proactiveMessage'>) => ({
  proactiveMessageString: parseProactiveMessage(proactiveMessage),
  buttonString: parseButton(button),
})

export const parseInitContainerCode = ({
  url,
  customDomain,
  backgroundColor,
  hiddenVariables,
}: IframeParams) => {
  const { customDomainString, hiddenVariablesString, bgColorString } =
    parseIframeParams({
      customDomain,
      hiddenVariables,
      backgroundColor,
    })
  return prettier.format(
    `Typebot.initContainer("typebot-container", {
    url: "${url}",${bgColorString}${customDomainString}${hiddenVariablesString}
  });`,
    { parser: 'babel', plugins: [parserBabel] }
  )
}

export const parseInitPopupCode = ({
  url,
  customDomain,
  hiddenVariables,
  backgroundColor,
  delay,
}: PopupParams) => {
  const { customDomainString, hiddenVariablesString, bgColorString } =
    parseIframeParams({
      customDomain,
      hiddenVariables,
      backgroundColor,
    })
  const { delayString } = parsePopupParams({ delay })
  return prettier.format(
    `var typebotCommands = Typebot.initPopup({url: "${url}",${delayString}${bgColorString}${customDomainString}${hiddenVariablesString}});`,
    { parser: 'babel', plugins: [parserBabel] }
  )
}

export const parseInitBubbleCode = ({
  url,
  customDomain,
  hiddenVariables,
  backgroundColor,
  button,
  proactiveMessage,
}: BubbleParams) => {
  const { customDomainString, hiddenVariablesString, bgColorString } =
    parseIframeParams({
      customDomain,
      hiddenVariables,
      backgroundColor,
    })
  const { buttonString, proactiveMessageString } = parseBubbleParams({
    button,
    proactiveMessage,
  })
  return prettier.format(
    `var typebotCommands = Typebot.initBubble({url: "${url}",${bgColorString}${customDomainString}${hiddenVariablesString}${proactiveMessageString}${buttonString}});`,
    { parser: 'babel', plugins: [parserBabel] }
  )
}

export const typebotJsHtml = `<script src="https://unpkg.com/typebot-js@2.2"></script>`
