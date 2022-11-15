import { ResultWithAnswers } from 'models'
import { stringify } from 'qs'
import { sendRequest } from 'utils'

export const getAllResultsQuery = async (
  workspaceId: string,
  typebotId: string
) => {
  const results = []
  let hasMore = true
  let lastResultId: string | undefined = undefined
  do {
    const query = stringify({ limit: 200, lastResultId, workspaceId })
    const { data, error } = await sendRequest<{ results: ResultWithAnswers[] }>(
      {
        url: `/api/typebots/${typebotId}/results?${query}`,
        method: 'GET',
      }
    )
    if (error) {
      console.error(error)
      break
    }
    results.push(...(data?.results ?? []))
    lastResultId = results[results.length - 1]?.id as string | undefined
    if (data?.results.length === 0) hasMore = false
  } while (hasMore)
  return results
}
