import { PublicTypebot } from 'models'
import { sendRequest } from 'utils'

export const createPublishedTypebotQuery = async (
  typebot: Omit<PublicTypebot, 'id'>,
  workspaceId: string
) =>
  sendRequest<PublicTypebot>({
    url: `/api/publicTypebots?workspaceId=${workspaceId}`,
    method: 'POST',
    body: typebot,
  })
