import { Result } from 'db'
import { sendRequest } from 'utils'

export const createResult = async (typebotId: string) => {
  return sendRequest<Result>({
    url: `/api/results`,
    method: 'POST',
    body: { typebotId },
  })
}

export const updateResult = async (
  resultId: string,
  result: Partial<Result>
) => {
  return sendRequest<Result>({
    url: `/api/results/${resultId}`,
    method: 'PATCH',
    body: result,
  })
}
