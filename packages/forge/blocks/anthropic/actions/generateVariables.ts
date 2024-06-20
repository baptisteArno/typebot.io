import { createAction } from '@sniper.io/forge'
import { auth } from '../auth'
import { isDefined } from '@sniper.io/lib'
import { createAnthropic } from '@ai-sdk/anthropic'
import { parseGenerateVariablesOptions } from '@sniper.io/openai-block/shared/parseGenerateVariablesOptions'
import { runGenerateVariables } from '@sniper.io/openai-block/shared/runGenerateVariables'
import { anthropicModels } from '../constants'

export const generateVariables = createAction({
  name: 'Generate variables',
  auth,
  options: parseGenerateVariablesOptions({ modelFetch: anthropicModels }),
  turnableInto: [
    {
      blockId: 'openai',
    },
    {
      blockId: 'mistral',
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
        model: createAnthropic({
          apiKey: credentials.apiKey,
        })(options.model),
        prompt: options.prompt,
        variablesToExtract: options.variablesToExtract,
        variables,
        logs,
      })
    },
  },
})
