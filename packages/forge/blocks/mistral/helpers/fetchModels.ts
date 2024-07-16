import ky from 'ky'
import { apiBaseUrl } from '../constants'

export const fetchModels = async ({
  credentials,
}: {
  credentials?: { apiKey?: string }
}) => {
  if (!credentials?.apiKey) return []

  const { data } = await ky
    .get(apiBaseUrl + '/v1/models', {
      headers: {
        Authorization: `Bearer ${credentials.apiKey}`,
      },
    })
    .json<{ data: { id: string }[] }>()

  return data.map((model) => model.id)
}
