import { PublicTypebot } from '@typebot.io/schemas'
import { sendRequest } from '@typebot.io/lib'

export const createPublishedTypebotQuery = async (
  typebot: Omit<PublicTypebot, 'id'>,
  workspaceId: string
) =>
  sendRequest<PublicTypebot>({
    url: `/api/publicTypebots?workspaceId=${workspaceId}`,
    method: 'POST',
    body: typebot,
  })
