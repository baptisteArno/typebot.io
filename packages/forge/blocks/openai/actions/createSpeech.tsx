import { option, createAction } from '@typebot.io/forge'
import { defaultOpenAIOptions, openAIVoices } from '../constants'
import OpenAI, { ClientOptions } from 'openai'
import { isNotEmpty } from '@typebot.io/lib'
import { createId } from '@typebot.io/lib/createId'
import { uploadFileToBucket } from '@typebot.io/lib/s3/uploadFileToBucket'
import { auth } from '../auth'
import { baseOptions } from '../baseOptions'

export const createSpeech = createAction({
  name: 'Create speech',
  auth,
  baseOptions,
  options: option.object({
    model: option.string.layout({
      fetcher: 'fetchSpeechModels',
      defaultValue: 'tts-1',
      placeholder: 'Select a model',
    }),
    input: option.string.layout({
      label: 'Input',
      inputType: 'textarea',
    }),
    voice: option.enum(openAIVoices).layout({
      label: 'Voice',
      placeholder: 'Select a voice',
    }),
    saveUrlInVariableId: option.string.layout({
      inputType: 'variableDropdown',
      label: 'Save URL in variable',
    }),
  }),
  getSetVariableIds: (options) =>
    options.saveUrlInVariableId ? [options.saveUrlInVariableId] : [],
  fetchers: [
    {
      id: 'fetchSpeechModels',
      dependencies: ['baseUrl', 'apiVersion'],
      fetch: async ({ credentials, options }) => {
        if (!credentials?.apiKey) return []

        const baseUrl = options?.baseUrl
        const config = {
          apiKey: credentials.apiKey,
          baseURL: baseUrl,
          defaultHeaders: {
            'api-key': credentials.apiKey,
          },
          defaultQuery: options?.apiVersion
            ? {
                'api-version': options.apiVersion,
              }
            : undefined,
        } satisfies ClientOptions

        const openai = new OpenAI(config)

        const models = await openai.models.list()

        return (
          models.data
            .filter((model) => model.id.includes('tts'))
            .sort((a, b) => b.created - a.created)
            .map((model) => model.id) ?? []
        )
      },
    },
  ],
  run: {
    server: async ({ credentials: { apiKey }, options, variables, logs }) => {
      if (!options.input) return logs.add('Create speech input is empty')
      if (!options.voice) return logs.add('Create speech voice is empty')
      if (!options.saveUrlInVariableId)
        return logs.add('Create speech save variable is empty')

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

      const model = options.model ?? defaultOpenAIOptions.voiceModel

      const rawAudio = (await openai.audio.speech.create({
        input: options.input,
        voice: options.voice,
        model,
      })) as any

      const url = await uploadFileToBucket({
        file: Buffer.from((await rawAudio.arrayBuffer()) as ArrayBuffer),
        key: `tmp/openai/audio/${createId() + createId()}.mp3`,
        mimeType: 'audio/mpeg',
      })

      variables.set(options.saveUrlInVariableId, url)
    },
  },
})
