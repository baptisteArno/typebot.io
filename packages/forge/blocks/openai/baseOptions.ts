import { option } from '@typebot.io/forge'

export const baseOptions = option
  .object({
    baseUrl: option.string.layout({
      accordion: 'Customize provider',
      label: 'Base URL',
    }),
    apiVersion: option.string.layout({
      accordion: 'Customize provider',
      label: 'API version',
    }),
  })
  .layout({
    isHidden: true,
  })
  .describe('Deprecated, use other dedicated OpenAI compatible blocks instead')
