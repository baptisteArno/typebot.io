import { createAction } from '@typebot.io/forge'
import { auth } from '../auth'
import { fetchGPTModels } from '../helpers/fetchModels'
import { isDefined } from '@typebot.io/lib'
import { runGenerateVariables } from '../shared/runGenerateVariables'
import { parseGenerateVariablesOptions } from '../shared/parseGenerateVariablesOptions'
import { createOpenAI } from '@ai-sdk/openai'

export const generateVariables = createAction({
  name: 'Generate variables',
  auth,
  options: parseGenerateVariablesOptions({ modelFetch: 'fetchModels' }),
  fetchers: [
    {
      id: 'fetchModels',
      dependencies: [],
      fetch: ({ credentials }) =>
        fetchGPTModels({
          apiKey: credentials?.apiKey,
          baseURL: credentials?.baseURL,
          apiVersion: credentials?.apiVersion,
        }),
    },
  ],
  turnableInto: [
    {
      blockId: 'mistral',
    },
    {
      blockId: 'anthropic',
      transform: (options) => ({
        ...options,
        model: undefined,
      }),
    },
  ],
  getSetVariableIds: (options) =>
    options.variablesToExtract?.map((v) => v.variableId).filter(isDefined) ??
    [],
  run: {
    server: ({ credentials, options, variables, logs }) => {
      if (credentials?.apiKey === undefined)
        return logs.add('No API key provided')

      if (options.model === undefined) return logs.add('No model provided')

      return runGenerateVariables({
        model: createOpenAI({
          apiKey: credentials.apiKey,
          compatibility: 'strict',
        })(options.model),
        prompt: options.prompt,
        variablesToExtract: options.variablesToExtract,
        variables,
        logs,
      })
    },
  },
})
