import { option } from '@typebot.io/forge'
import { defaultInstantchatOptions } from './constants'

export const baseOptions = option.object({
  baseUrl: option.string.layout({
    accordion: 'Customize provider',
    label: 'Base URL',
    defaultValue: defaultInstantchatOptions.baseKwikUrl,
    withVariableButton: false,
    isRequired: true,
  }),
  wsKey: option.string.layout({
    accordion: 'Customize provider',
    label: 'Webservice key',
    defaultValue: '',
    withVariableButton: false,
    isRequired: true,
  }),
  accountcode: option.string.layout({
    accordion: 'Customize provider',
    label: 'Accountcode',
    defaultValue: '',
    withVariableButton: false,
    isRequired: true,
  }),

  cortexUrl: option.string.layout({
    accordion: 'Cortex',
    label: 'Cortex URL',
    defaultValue: defaultInstantchatOptions.baseKwikUrl,
    withVariableButton: false,
    isRequired: true,
  }),
  cortexAccountID: option.string.layout({
    accordion: 'Cortex',
    label: 'Cortex Account ID',
    defaultValue: '',
    withVariableButton: false,
    isRequired: false,
  }),
  cortexToken: option.string.layout({
    accordion: 'Cortex',
    label: 'Cortex Token',
    defaultValue: '',
    withVariableButton: false,
    isRequired: false,
  }),
})
