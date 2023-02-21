import { BotProps } from '@typebot.io/js'
import { isDefined } from 'utils'

export const parseStringParam = (fieldName: string, fieldValue?: string) =>
  fieldValue ? `${fieldName}: "${fieldValue}",` : ``

export const parseNumberOrBoolParam = (
  fieldName: string,
  fieldValue?: number | boolean
) => (isDefined(fieldValue) ? `${fieldName}: ${fieldValue},` : ``)

export const parseBotProps = ({ typebot, apiHost }: BotProps) => {
  const typebotLine = parseStringParam('typebot', typebot as string)
  const apiHostLine = parseStringParam('apiHost', apiHost)
  return `${typebotLine}${apiHostLine}`
}

export const parseReactStringParam = (fieldName: string, fieldValue?: string) =>
  fieldValue ? `${fieldName}="${fieldValue}"` : ``

export const parseReactNumberOrBoolParam = (
  fieldName: string,
  fieldValue?: number | boolean
) => (isDefined(fieldValue) ? `${fieldName}={${fieldValue}}` : ``)

export const parseReactBotProps = ({ typebot, apiHost }: BotProps) => {
  const typebotLine = parseReactStringParam('typebot', typebot as string)
  const apiHostLine = parseReactStringParam('apiHost', apiHost)
  return `${typebotLine} ${apiHostLine}`
}

export const typebotImportUrl = `https://cdn.jsdelivr.net/npm/@typebot.io/js@0.0.10/dist/web.js`
