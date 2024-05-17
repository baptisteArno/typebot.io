import { Result } from '@typebot.io/schemas'
import { sendRequest } from '@typebot.io/lib'

export const updateResultQuery = async (
  resultId: string,
  result: Partial<Result>
) =>
  sendRequest<Result>({
    url: `/api/eddies/t/results/${resultId}`,
    method: 'PATCH',
    body: result,
  })
