import { Answer } from 'models'
import { sendRequest } from 'utils'

export const upsertAnswer = async (answer: Answer & { resultId: string }) => {
  return sendRequest<Answer>({
    url: `/api/answers`,
    method: 'PUT',
    body: answer,
  })
}
