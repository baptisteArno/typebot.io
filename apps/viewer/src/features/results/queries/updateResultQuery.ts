import { Result } from '@sniper.io/schemas'
import { sendRequest } from '@sniper.io/lib'

export const updateResultQuery = async (
  resultId: string,
  result: Partial<Result>
) =>
  sendRequest<Result>({
    url: `/api/snipers/t/results/${resultId}`,
    method: 'PATCH',
    body: result,
  })
