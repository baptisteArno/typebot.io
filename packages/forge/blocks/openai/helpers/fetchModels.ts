import OpenAI, { ClientOptions } from 'openai'
import { defaultOpenAIOptions } from '../constants'

type Props = {
  apiKey?: string
  baseUrl?: string
  apiVersion?: string
}

export const fetchGPTModels = async ({
  apiKey,
  baseUrl = defaultOpenAIOptions.baseUrl,
  apiVersion,
}: Props) => {
  if (!apiKey) return []

  const config = {
    apiKey: apiKey,
    baseURL: baseUrl ?? defaultOpenAIOptions.baseUrl,
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

  const models = await openai.models.list()

  return (
    models.data
      .filter((model) => model.id.includes('gpt'))
      .sort((a, b) => b.created - a.created)
      .map((model) => model.id) ?? []
  )
}
