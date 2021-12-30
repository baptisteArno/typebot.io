import { Answer } from 'db'
import { sendRequest } from 'utils'

export const upsertAnswer = async (answer: Answer) => {
  return sendRequest<Answer>({
    url: `/api/answers`,
    method: 'PUT',
    body: answer,
  })
}
