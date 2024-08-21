import { option, createAction } from '@typebot.io/forge'
import { defaultOpenAIOptions } from '../constants'
import OpenAI, { ClientOptions, toFile } from 'openai'
import { isNotEmpty } from '@typebot.io/lib'
import { auth } from '../auth'
import { baseOptions } from '../baseOptions'
import ky from 'ky'

export const createTranscription = createAction({
  name: 'Create transcription',
  auth,
  baseOptions,
  options: option.object({
    url: option.string.layout({
      label: 'Audio URL',
    }),
    transcriptionVariableId: option.string.layout({
      label: 'Save result to',
      inputType: 'variableDropdown',
    }),
  }),
  getSetVariableIds: (options) =>
    options.transcriptionVariableId ? [options.transcriptionVariableId] : [],
  run: {
    server: async ({ credentials: { apiKey }, options, variables, logs }) => {
      if (!options.url) return logs.add('Audio URL is empty')
      if (!options.transcriptionVariableId)
        return logs.add('Missing transcription variable')

      const config = {
        apiKey,
        baseURL: options.baseUrl,
        defaultHeaders: {
          'api-key': apiKey,
        },
        defaultQuery: isNotEmpty(options.apiVersion)
          ? {
              'api-version': options.apiVersion,
            }
          : undefined,
      } satisfies ClientOptions

      const openai = new OpenAI(config)

      const result = await openai.audio.transcriptions.create({
        file: await fetch(options.url),
        model: 'whisper-1',
      })

      variables.set(options.transcriptionVariableId, result.text)
    },
  },
})
