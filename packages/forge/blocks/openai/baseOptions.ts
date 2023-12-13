import { option } from '@typebot.io/forge'
import { defaultOpenAIOptions } from './constants'

export const baseOptions = option.object({
  baseUrl: option.string.layout({
    accordion: 'Customize provider',
    label: 'Base URL',
    defaultValue: defaultOpenAIOptions.baseUrl,
  }),
  apiVersion: option.string.layout({
    accordion: 'Customize provider',
    label: 'API version',
  }),
})
