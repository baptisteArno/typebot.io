import { option } from '@typebot.io/forge'
import { defaultOpenAIOptions } from './constants'

export const baseOptions = option.object({
  baseUrl: option.string.default(defaultOpenAIOptions.baseUrl),
  apiVersion: option.string.default(defaultOpenAIOptions.apiVersion),
})
