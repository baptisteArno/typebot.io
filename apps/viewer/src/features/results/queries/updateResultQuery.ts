import { Result } from 'models'
import { sendRequest } from 'utils'

export const updateResultQuery = async (
  resultId: string,
  result: Partial<Result>
) =>
  sendRequest<Result>({
    url: `/api/typebots/t/results/${resultId}`,
    method: 'PATCH',
    body: result,
  })
