import { option, createAction } from '@typebot.io/forge'
import { baseOptions } from '../baseOptions'

export const trackEvent = createAction({
  baseOptions,
  name: 'Track event',
  options: option.object({
    eventAction: option.string.layout({
      placeholder: 'I.e. conversion',
    }),
    category: option.string.layout({
      label: 'Category',
      placeholder: 'I.e. Typebot',
      accordion: 'Advanced',
    }),
    label: option.string.layout({
      label: 'Label',
      placeholder: 'I.e. Campaign Z',
      accordion: 'Advanced',
    }),
    value: option.number.layout({
      label: 'Value',
      placeholder: 'I.e. 42',
      accordion: 'Advanced',
    }),
    sendTo: option.string.layout({
      label: 'Send to',
      placeholder: 'I.e. AW-XXXXXXXXX',
      moreInfoTooltip: 'Useful to send a conversion event to Google Ads',
      accordion: 'Advanced',
    }),
  }),
  run: {
    web: {
      parseFunction: ({
        options: { eventAction, category, label, sendTo, value },
      }) => {
        return {
          args: {
            action: eventAction ?? null,
            event_category: category ?? null,
            event_label: label ?? null,
            value: value ?? null,
            send_to: sendTo ?? null,
          },
          content: `if (!window.gtag) {
            console.error('Google Analytics was not properly initialized')
            return
          }
          window.gtag('event', action, {
            event_category,
            event_label,
            value,
            send_to
          })`,
        }
      },
    },
  },
})
