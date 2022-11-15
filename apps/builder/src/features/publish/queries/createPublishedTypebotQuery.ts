import { PublicTypebot } from 'models'
import { sendRequest } from 'utils'

export const createPublishedTypebotQuery = async (
  typebot: PublicTypebot,
  workspaceId: string
) =>
  sendRequest<PublicTypebot>({
    url: `/api/publicTypebots?workspaceId=${workspaceId}`,
    method: 'POST',
    body: typebot,
  })
