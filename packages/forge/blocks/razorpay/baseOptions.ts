import { option } from '@typebot.io/forge'
import { allowedCurrencies, defaultCurrency, defaultThemeColor, defaultUidLabel } from './constants'

export const baseOptions = option.object({
  keyId: option.string.layout({
    accordion: 'Configuration',
    label: 'Key ID',
    isRequired: true,
    helperText: 'You can generate an API key and secret [here](https://dashboard.razorpay.com/app/api-keys).',
  }),
  companyName: option.string.layout({
    accordion: 'Configuration',
    label: 'Company Name',
    isRequired: true,
    moreInfoTooltip: 'Company Name that shows up on Payment popup',
  }),
  companyLogo: option.string.layout({
    accordion: 'Configuration',
    label: 'Company Logo',
    isRequired: true,
    moreInfoTooltip: 'Image url of company logo',
  }),
  currency: option.enum(allowedCurrencies).layout({
    accordion: 'Configuration',
    label: 'Currency',
    moreInfoTooltip: 'Set a default Currency',
    defaultValue: defaultCurrency
  }),
  themeColor: option.string.layout({
    accordion: 'Configuration',
    label: 'Theme color',
    moreInfoTooltip: 'Theme color as html color eg. #3399cc',
    defaultValue: defaultThemeColor
  }),
  uidLabel: option.string.layout({
    accordion: 'Configuration',
    label: 'Unique ID Label',
    moreInfoTooltip: 'Label used in transactions for unique ID',
    defaultValue: defaultUidLabel
  }),

})
