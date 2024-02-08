import { createAction, option } from '@typebot.io/forge'
import { auth } from '../auth'
import { baseUrl } from '../constants'
import { ModelsResponse, VoicesResponse } from '../type'
import got, { HTTPError } from 'got'
import { uploadFileToBucket } from '@typebot.io/lib/s3/uploadFileToBucket'
import { createId } from '@typebot.io/lib/createId'

export const convertTextToSpeech = createAction({
  name: 'Convert text to speech',
  auth,
  options: option.object({
    text: option.string.layout({
      label: 'Text',
      inputType: 'textarea',
      placeholder: 'Enter the text to convert to speech',
    }),
    voiceId: option.string.layout({
      fetcher: 'fetchVoices',
      label: 'Voice ID',
      placeholder: 'Select a voice',
    }),
    modelId: option.string.layout({
      fetcher: 'fetchModels',
      label: 'Model ID',
      placeholder: 'Select a model',
      defaultValue: 'eleven_monolingual_v1',
    }),
    saveUrlInVariableId: option.string.layout({
      label: 'Save audio URL in variable',
      placeholder: 'Select a variable',
      inputType: 'variableDropdown',
    }),
  }),
  getSetVariableIds: ({ saveUrlInVariableId }) =>
    saveUrlInVariableId ? [saveUrlInVariableId] : [],
  fetchers: [
    {
      id: 'fetchVoices',
      fetch: async ({ credentials }) => {
        const response = await got
          .get(baseUrl + '/v1/voices', {
            headers: {
              'xi-api-key': credentials.apiKey,
            },
          })
          .json<VoicesResponse>()

        return response.voices.map((voice) => ({
          value: voice.voice_id,
          label: voice.name,
        }))
      },
      dependencies: [],
    },
    {
      id: 'fetchModels',
      fetch: async ({ credentials }) => {
        const response = await got
          .get(baseUrl + '/v1/models', {
            headers: {
              'xi-api-key': credentials.apiKey,
            },
          })
          .json<ModelsResponse>()

        return response.map((model) => ({
          value: model.model_id,
          label: model.name,
        }))
      },
      dependencies: [],
    },
  ],
  run: {
    server: async ({ credentials, options, variables, logs }) => {
      if (!options.voiceId) return logs.add('Voice ID is missing')
      if (!options.text) return logs.add('Text is missing')
      if (!options.saveUrlInVariableId)
        return logs.add('Save variable is missing')

      try {
        const response = await got
          .post(baseUrl + '/v1/text-to-speech/' + options.voiceId, {
            headers: {
              Accept: 'audio/mpeg',
              'xi-api-key': credentials.apiKey,
            },
            json: {
              model_id: options.modelId,
              text: options.text,
            },
          })
          .buffer()

        const url = await uploadFileToBucket({
          file: response,
          key: `tmp/elevenlabs/audio/${createId() + createId()}.mp3`,
          mimeType: 'audio/mpeg',
        })

        variables.set(options.saveUrlInVariableId, url)
      } catch (err) {
        if (err instanceof HTTPError) {
          return logs.add({
            status: 'error',
            description: err.message,
            details: err.response.body,
          })
        }
      }
    },
  },
})
