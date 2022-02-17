import { Result } from 'db'
import { VariableWithValue } from 'models'
import { sendRequest } from 'utils'

export const createResult = async (
  typebotId: string,
  prefilledVariables: VariableWithValue[]
) => {
  return sendRequest<Result>({
    url: `/api/results`,
    method: 'POST',
    body: { typebotId, prefilledVariables },
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
