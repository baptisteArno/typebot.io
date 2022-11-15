import { stringify } from 'qs'
import { sendRequest } from 'utils'

export const deleteResultsQuery = async (
  workspaceId: string,
  typebotId: string,
  ids: string[]
) => {
  const params = stringify({
    workspaceId,
  })
  return sendRequest({
    url: `/api/typebots/${typebotId}/results?${params}`,
    method: 'DELETE',
    body: {
      ids,
    },
  })
}
