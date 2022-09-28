import { config } from 'config/octadesk.config'
import { Answer } from 'models'
import { sendRequest } from 'utils'

export const upsertAnswer = async (answer: Answer & { resultId: string }) =>
  sendRequest<Answer>({
    url: `${config.basePath}/api/typebots/t/results/r/answers`,
    method: 'PUT',
    body: answer,
  })
