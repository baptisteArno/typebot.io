import OpenAI, { ClientOptions } from 'openai'

type Props = {
  apiKey?: string
  baseURL?: string
  apiVersion?: string
}

export const fetchGPTModels = async ({
  apiKey,
  baseURL,
  apiVersion,
}: Props) => {
  if (!apiKey) return []

  const config = {
    apiKey,
    baseURL,
    defaultHeaders: {
      'api-key': apiKey,
    },
    defaultQuery: {
      'api-version': apiVersion,
    },
  } satisfies ClientOptions

  const openai = new OpenAI(config)

  const models = await openai.models.list()

  return (
    models.data
      .sort((a, b) => b.created - a.created)
      .map((model) => model.id) ?? []
  )
}
