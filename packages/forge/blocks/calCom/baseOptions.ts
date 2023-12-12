import { option } from '@typebot.io/forge'
import { defaultBaseUrl } from './constants'

export const baseOptions = option.object({
  baseUrl: option.string.layout({
    label: 'Base origin',
    placeholder: 'https://cal.com',
    defaultValue: defaultBaseUrl,
<<<<<<< HEAD
    accordion: 'Custom provider',
=======
    accordion: 'Customize host',
>>>>>>> feat/the-forge
  }),
})
