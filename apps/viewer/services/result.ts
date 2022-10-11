import { config } from 'config/octadesk.config'
import { Result } from 'db'
import { sendRequest } from 'utils'

export const createResult = async (typebotId: string) => {
  return sendRequest<Result>({
    url: `${config.basePath}/api/typebots/${typebotId}/results`,
    method: 'POST',
  })
}

export const updateResult = async (resultId: string, result: Partial<Result>) =>
  sendRequest<Result>({
    url: `${config.basePath}/api/typebots/t/results/${resultId}`,
    method: 'PATCH',
    body: result,
  })
