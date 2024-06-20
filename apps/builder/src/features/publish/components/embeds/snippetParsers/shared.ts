import { BotProps } from '@sniper.io/nextjs'
import parserBabel from 'prettier/parser-babel'
import prettier from 'prettier/standalone'
import { isDefined } from '@sniper.io/lib'
import { Sniper } from '@sniper.io/schemas'
import { isCloudProdInstance } from '@/helpers/isCloudProdInstance'
import packageJson from '../../../../../../../../packages/embeds/js/package.json'
import { env } from '@sniper.io/env'

export const parseStringParam = (
  fieldName: string,
  fieldValue?: string,
  defaultValue?: string
) => {
  if (!fieldValue) return ''
  if (isDefined(defaultValue) && fieldValue === defaultValue) return ''
  return `${fieldName}: "${fieldValue}",`
}

export const parseNumberOrBoolParam = (
  fieldName: string,
  fieldValue?: number | boolean
) => (isDefined(fieldValue) ? `${fieldName}: ${fieldValue},` : ``)

export const parseBotProps = ({ sniper, apiHost }: BotProps) => {
  const sniperLine = parseStringParam('sniper', sniper as string)
  const apiHostLine = parseStringParam('apiHost', apiHost)
  return `${sniperLine}${apiHostLine}`
}

export const parseReactStringParam = (fieldName: string, fieldValue?: string) =>
  fieldValue ? `${fieldName}="${fieldValue}"` : ``

export const parseReactNumberOrBoolParam = (
  fieldName: string,
  fieldValue?: number | boolean
) => (isDefined(fieldValue) ? `${fieldName}={${fieldValue}}` : ``)

export const parseReactBotProps = ({ sniper, apiHost }: BotProps) => {
  const sniperLine = parseReactStringParam('sniper', sniper as string)
  const apiHostLine = parseReactStringParam('apiHost', apiHost)
  return `${sniperLine} ${apiHostLine}`
}

export const sniperImportCode = isCloudProdInstance()
  ? `import Sniper from 'https://cdn.jsdelivr.net/npm/@sniper.io/js@0.2/dist/web.js'`
  : `import Sniper from 'https://cdn.jsdelivr.net/npm/@sniper.io/js@${packageJson.version}/dist/web.js'`

export const parseInlineScript = (script: string) =>
  prettier.format(
    `const sniperInitScript = document.createElement("script");
  sniperInitScript.type = "module";
  sniperInitScript.innerHTML = \`${script}\`;
  document.body.append(sniperInitScript);`,
    { parser: 'babel', plugins: [parserBabel] }
  )

export const parseApiHost = (
  customDomain: Sniper['customDomain'] | undefined
) => {
  if (customDomain) return new URL(`https://${customDomain}`).origin
  return env.NEXT_PUBLIC_VIEWER_URL.at(1) ?? env.NEXT_PUBLIC_VIEWER_URL[0]
}

export const parseApiHostValue = (
  customDomain: Sniper['customDomain'] | undefined
) => {
  if (isCloudProdInstance()) return
  return parseApiHost(customDomain)
}
