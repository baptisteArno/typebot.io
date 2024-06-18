import { Result } from '@sniper.io/schemas'
import { sendRequest } from '@sniper.io/lib'

export const createResultQuery = async (sniperId: string) => {
  return sendRequest<{ result: Result; hasReachedLimit: boolean }>({
    url: `/api/snipers/${sniperId}/results`,
    method: 'POST',
  })
}
