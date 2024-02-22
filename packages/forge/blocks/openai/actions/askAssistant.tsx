import { createAction, option } from '@typebot.io/forge'
import { isDefined, isEmpty } from '@typebot.io/lib'
import { auth } from '../auth'
import { ClientOptions, OpenAI } from 'openai'
import { baseOptions } from '../baseOptions'
import { executeFunction } from '@typebot.io/variables/executeFunction'

export const askAssistant = createAction({
  auth,
  baseOptions,
  name: 'Ask Assistant',
  options: option.object({
    assistantId: option.string.layout({
      label: 'Assistant ID',
      placeholder: 'Select an assistant',
      moreInfoTooltip: 'The OpenAI assistant you want to ask question to.',
      fetcher: 'fetchAssistants',
    }),
    threadId: option.string.layout({
      label: 'Thread ID',
      moreInfoTooltip:
        'Used to remember the conversation with the user. If empty, a new thread is created.',
    }),
    message: option.string.layout({
      label: 'Message',
      inputType: 'textarea',
    }),
    functions: option
      .array(
        option.object({
          name: option.string.layout({
            fetcher: 'fetchAssistantFunctions',
            label: 'Name',
          }),
          code: option.string.layout({
            inputType: 'code',
            label: 'Code',
            lang: 'javascript',
            moreInfoTooltip:
              'A javascript code snippet that can use the defined parameters. It should return a value.',
            withVariableButton: false,
          }),
        })
      )
      .layout({ accordion: 'Functions', itemLabel: 'function' }),
    responseMapping: option
      .saveResponseArray(['Message', 'Thread ID'] as const)
      .layout({
        accordion: 'Save response',
      }),
  }),
  fetchers: [
    {
      id: 'fetchAssistants',
      fetch: async ({ options, credentials }) => {
        const config = {
          apiKey: credentials.apiKey,
          baseURL: options.baseUrl,
          defaultHeaders: {
            'api-key': credentials.apiKey,
          },
          defaultQuery: options.apiVersion
            ? {
                'api-version': options.apiVersion,
              }
            : undefined,
        } satisfies ClientOptions

        const openai = new OpenAI(config)

        const response = await openai.beta.assistants.list()

        return response.data
          .map((assistant) =>
            assistant.name
              ? {
                  label: assistant.name,
                  value: assistant.id,
                }
              : undefined
          )
          .filter(isDefined)
      },
      dependencies: ['baseUrl', 'apiVersion'],
    },
    {
      id: 'fetchAssistantFunctions',
      fetch: async ({ options, credentials }) => {
        if (!options.assistantId) return []
        const config = {
          apiKey: credentials.apiKey,
          baseURL: options.baseUrl,
          defaultHeaders: {
            'api-key': credentials.apiKey,
          },
          defaultQuery: options.apiVersion
            ? {
                'api-version': options.apiVersion,
              }
            : undefined,
        } satisfies ClientOptions

        const openai = new OpenAI(config)

        const response = await openai.beta.assistants.retrieve(
          options.assistantId
        )

        return response.tools
          .filter((tool) => tool.type === 'function')
          .map((tool) =>
            tool.type === 'function' && tool.function.name
              ? tool.function.name
              : undefined
          )
          .filter(isDefined)
      },
      dependencies: ['baseUrl', 'apiVersion', 'assistantId'],
    },
  ],
  getSetVariableIds: ({ responseMapping }) =>
    responseMapping?.map((r) => r.variableId).filter(isDefined) ?? [],
  run: {
    server: async ({
      credentials: { apiKey },
      options: {
        baseUrl,
        apiVersion,
        assistantId,
        message,
        responseMapping,
        threadId,
        functions,
      },
      variables,
      logs,
    }) => {
      if (isEmpty(assistantId)) {
        logs.add('Assistant ID is empty')
        return
      }
      if (isEmpty(message)) {
        logs.add('Message is empty')
        return
      }
      const config = {
        apiKey,
        baseURL: baseUrl,
        defaultHeaders: {
          'api-key': apiKey,
        },
        defaultQuery: apiVersion
          ? {
              'api-version': apiVersion,
            }
          : undefined,
      } satisfies ClientOptions

      const openai = new OpenAI(config)

      // Create a thread if needed
      const currentThreadId = isEmpty(threadId)
        ? (await openai.beta.threads.create({})).id
        : threadId

      // Add a message to the thread
      const createdMessage = await openai.beta.threads.messages.create(
        currentThreadId,
        {
          role: 'user',
          content: message,
        }
      )

      const run = await openai.beta.threads.runs.create(currentThreadId, {
        assistant_id: assistantId,
      })

      async function waitForRun(run: OpenAI.Beta.Threads.Runs.Run) {
        // Poll for status change
        while (run.status === 'queued' || run.status === 'in_progress') {
          await new Promise((resolve) => setTimeout(resolve, 500))

          run = await openai.beta.threads.runs.retrieve(currentThreadId, run.id)
        }

        // Check the run status
        if (
          run.status === 'cancelled' ||
          run.status === 'cancelling' ||
          run.status === 'failed' ||
          run.status === 'expired'
        ) {
          throw new Error(run.status)
        }
        if (run.status === 'requires_action') {
          if (run.required_action?.type === 'submit_tool_outputs') {
            const tool_outputs = (
              await Promise.all(
                run.required_action.submit_tool_outputs.tool_calls.map(
                  async (toolCall) => {
                    const parameters = JSON.parse(toolCall.function.arguments)

                    const functionToExecute = functions?.find(
                      (f) => f.name === toolCall.function.name
                    )
                    if (!functionToExecute) return

                    const name = toolCall.function.name
                    if (!name || !functionToExecute.code) return

                    const { output, newVariables } = await executeFunction({
                      variables: variables.list(),
                      body: functionToExecute.code,
                      args: parameters,
                    })

                    newVariables?.forEach((variable) => {
                      variables.set(variable.id, variable.value)
                    })

                    return {
                      tool_call_id: toolCall.id,
                      output,
                    }
                  }
                )
              )
            ).filter(isDefined)

            run = await openai.beta.threads.runs.submitToolOutputs(
              currentThreadId,
              run.id,
              { tool_outputs }
            )

            await waitForRun(run)
          }
        }
      }

      await waitForRun(run)

      const responseMessages = (
        await openai.beta.threads.messages.list(currentThreadId, {
          after: createdMessage.id,
          order: 'asc',
        })
      ).data

      responseMapping?.forEach((mapping) => {
        if (!mapping.variableId) return
        if (!mapping.item || mapping.item === 'Message') {
          let message = ''
          const messageContents = responseMessages[0].content
          for (const content of messageContents) {
            switch (content.type) {
              case 'text':
                message +=
                  (message !== '' ? '\n\n' : '') +
                  content.text.value.replace(/【.+】/g, '')
                break
            }
          }
          variables.set(mapping.variableId, message)
        }
        if (mapping.item === 'Thread ID')
          variables.set(mapping.variableId, currentThreadId)
      })
    },
  },
})
