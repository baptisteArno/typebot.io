import { createAction, option } from '@typebot.io/forge'

export const endWorkflow = createAction({
  name: 'Return Output',
  run: {
    server: ({ logs, options, lastEndpointResponse }) => {
      const responseType = options.responseType ?? 'Last HTTP Response'
      let response: unknown

      if (responseType === 'Last HTTP Response') {
        response = lastEndpointResponse
      } else if (options.customJson) {
        try {
          response = JSON.parse(options.customJson)
        } catch {
          response = options.customJson
        }
      }

      logs.add({
        status: 'success',
        description: 'Tool Output',
        details: {
          action: 'END_WORKFLOW',
          responseType,
          response,
        },
      })
    },
  },
  options: option.object({
    responseType: option
      .enum(['Last HTTP Response', 'Custom JSON'])
      .layout({
        label: 'Response Type',
        defaultValue: 'Last HTTP Response',
        direction: 'row',
      }),
    customJson: option.string.layout({
      label: 'Custom JSON',
      inputType: 'code',
      lang: 'json',
      accordion: 'Output config',
      isHidden: (options) => options.responseType !== 'Custom JSON',
    }),
  }),
})
