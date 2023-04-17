import { BotProps } from '@typebot.io/js'
import parserBabel from 'prettier/parser-babel'
import prettier from 'prettier/standalone'
import { env, getViewerUrl, isDefined } from '@typebot.io/lib'
import { Typebot } from '@typebot.io/schemas'
import { isCloudProdInstance } from '@/helpers/isCloudProdInstance'
import packageJson from '../../../../../../../../packages/embeds/js/package.json'

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

export const typebotImportCode = isCloudProdInstance
  ? `import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0.0/dist/web.js'`
  : `import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@${packageJson.version}/dist/web.js'`

export const parseInlineScript = (script: string) =>
  prettier.format(
    `const typebotInitScript = document.createElement("script");
  typebotInitScript.type = "module";
  typebotInitScript.innerHTML = \`${script}\`;
  document.body.append(typebotInitScript);`,
    { parser: 'babel', plugins: [parserBabel] }
  )

export const parseApiHost = (
  customDomain: Typebot['customDomain'] | undefined
) => {
  if (customDomain) return new URL(`https://${customDomain}`).origin
  return env('VIEWER_INTERNAL_URL') ?? getViewerUrl()
}

export const parseApiHostValue = (
  customDomain: Typebot['customDomain'] | undefined
) => {
  if (isCloudProdInstance) return
  return parseApiHost(customDomain)
}
