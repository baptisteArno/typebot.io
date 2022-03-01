import { Log, Result } from 'db'
import { VariableWithValue } from 'models'
import { sendRequest } from 'utils'

export const createResult = async (
  typebotId: string,
  prefilledVariables: VariableWithValue[]
) => {
  return sendRequest<Result>({
    url: `/api/typebots/${typebotId}/results`,
    method: 'POST',
    body: { prefilledVariables },
  })
}

export const updateResult = async (resultId: string, result: Partial<Result>) =>
  sendRequest<Result>({
    url: `/api/typebots/t/results/${resultId}`,
    method: 'PATCH',
    body: result,
  })

export const createLog = (
  resultId: string,
  log: Omit<Log, 'id' | 'createdAt' | 'resultId'>
) =>
  sendRequest<Result>({
    url: `/api/typebots/t/results/${resultId}/logs`,
    method: 'POST',
    body: log,
  })
