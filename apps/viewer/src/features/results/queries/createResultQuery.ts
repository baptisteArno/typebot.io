import { Result } from 'models'
import { sendRequest } from 'utils'

export const createResultQuery = async (typebotId: string) => {
  return sendRequest<{ result: Result; hasReachedLimit: boolean }>({
    url: `/api/typebots/${typebotId}/results`,
    method: 'POST',
  })
}
