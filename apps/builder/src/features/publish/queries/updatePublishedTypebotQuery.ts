import { PublicTypebot } from 'models'
import { sendRequest } from 'utils'

export const updatePublishedTypebotQuery = async (
  id: string,
  typebot: Omit<PublicTypebot, 'id'>,
  workspaceId: string
) =>
  sendRequest({
    url: `/api/publicTypebots/${id}?workspaceId=${workspaceId}`,
    method: 'PUT',
    body: typebot,
  })
