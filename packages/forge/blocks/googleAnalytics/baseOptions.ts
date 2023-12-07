import { option } from '@typebot.io/forge'

export const baseOptions = option.object({
  measurementId: option.string.layout({
    label: 'Measurement ID',
    moreInfoTooltip:
      'Can be found by clicking on your data stream in Google Analytics dashboard',
    placeholder: 'G-XXXXXXXXXX',
  }),
})
