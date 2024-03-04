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
    messages: option.saveResponseArray(['User Input'] as const).layout({
      accordion: 'Messages',
    }),
    responseMapping: option
      .saveResponseArray(['Message Content'] as const)
      .layout({
        accordion: 'Save Response',
      }),
  }),
  run: {
    server: async ({ credentials: { apiKey }, options, variables }) => {
      const client = new Anthropic({
        apiKey: apiKey,
      })

      let userInput = ''
      options.messages?.forEach((mapping) => {
        if (!mapping.variableId) return

        if (!mapping.item || mapping.item === 'User Input')
          userInput = variables.get(mapping.variableId) as string
      })

      // TODO: implement chat history
      // - put input var option
      // - read input var and send msg (along with prevs msgs)
      // - receive res -> show it on client -> store it in a msgs array
      // -- loop from 2

      const message = await client.messages.create({
        messages: [
          {
            role: 'user',
            content: userInput,
          },
        ],
        model: options.mdl as string, // Stinky cast since we will always have mdl set
        max_tokens: 1024,
      })

      options.responseMapping?.forEach((mapping) => {
        if (!mapping.variableId) return

        if (!mapping.item || mapping.item === 'Message Content')
          variables.set(mapping.variableId, message.content[0].text)
      })
    },
  },
})
