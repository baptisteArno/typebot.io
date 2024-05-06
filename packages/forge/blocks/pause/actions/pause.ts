import { createAction, option } from '@typebot.io/forge'

export const pauseAction = createAction({
  name: 'Pause',
  options: option.object({
    duration: option.number.layout({
      label: 'Duration',
      isRequired: true,
      moreInfoTooltip: 'Duração da pausa',
    }),
    unit: option.enum(['segundos', 'minutos', 'horas', 'dias']).layout({
      label: 'Unit',
      isRequired: true,
      defaultValue: 'dias',
      moreInfoTooltip: 'Unidade de tempo da pausa',
    }),
  }),
  run: {
    web: {
      displayEmbedBubble: {
        parseUrl: ({}) => '',
        maxBubbleWidth: 780,
        waitForEvent: {
          parseFunction: () => {
            return {
              args: {},
              content: ``,
            }
          },
        },
        parseInitFunction: ({ options, variables, credentials }) => {
          const { duration, unit } = options
          return {
            args: {
              duration: duration?.toString() || '0',
              unit: unit || 'dias',
              action: 'pause',
            },
            content: ``,
          }
        },
      },
    },
  },
})
