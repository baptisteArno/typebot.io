import { Answer } from 'models'
import { sendRequest } from 'utils'

export const upsertAnswer = async (answer: Answer & { resultId: string }) =>
  sendRequest<Answer>({
    url: `${process.env.BASE_PATH}/api/typebots/t/results/r/answers`,
    method: 'PUT',
    body: answer,
  })
