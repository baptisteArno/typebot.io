import { createAction, option } from '@typebot.io/forge'
import { auth } from '../auth'
import { Anthropic } from '@anthropic-ai/sdk'
import { claudeModels } from '../constants'

export const createMessage = createAction({
  auth,
  name: 'Create Message',
  options: option.object({
    mdl: option.enum(claudeModels).layout({
      defaultValue: 'claude-2.1',
      label: 'Claude Model',
      isRequired: true,
    }),
    responseMapping: option
      .saveResponseArray(['content_block_delta'] as const)
      .layout({
        accordion: 'Save Response',
      }),
  }),
  run: {
    stream: {
      getStreamVariableId: (options) =>
        options.responseMapping?.find(
          (res) => res.item === 'content_block_delta' || !res.item
        )?.variableId,
      run: async ({ credentials: { apiKey }, options, variables }) => {
        const client = new Anthropic({
          apiKey: apiKey,
        })

        const stream = client.messages.stream({
          messages: [
            {
              role: 'user',
              content: 'Hey Claude! How are you doing?',
            },
          ],
          model: options.mdl as string, // Stinky cast since we will always have mdl set
          max_tokens: 1024,
        })

        for await (const event of stream) {
          console.log('content_block_delta', event)
        }

        const message = await stream.finalMessage()
        console.log('finalMessage', message)

        return stream.toReadableStream()

        // TODO: implement
        // - put input var option
        // - read input var and send msg (along with prevs msgs)
        // - receive res -> show it on client -> store it in a msgs array
        // -- loop from 2
      },
    },
  },
})
