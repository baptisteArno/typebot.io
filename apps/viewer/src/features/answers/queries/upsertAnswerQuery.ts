import { Answer, AnswerInput } from 'models'
import { sendRequest } from 'utils'

export const upsertAnswerQuery = async (
  answer: AnswerInput & { resultId: string } & { uploadedFiles?: boolean }
) =>
  sendRequest<Answer>({
    url: `/api/typebots/t/results/r/answers`,
    method: 'PUT',
    body: answer,
  })
