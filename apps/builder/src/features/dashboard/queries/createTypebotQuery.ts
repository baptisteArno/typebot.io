import { Typebot } from 'models'
import { sendRequest } from 'utils'

export const createTypebotQuery = async ({
  folderId,
  workspaceId,
}: Pick<Typebot, 'folderId' | 'workspaceId'>) => {
  const typebot = {
    folderId,
    name: 'My typebot',
    workspaceId,
  }
  return sendRequest<Typebot>({
    url: `/api/typebots`,
    method: 'POST',
    body: typebot,
  })
}
