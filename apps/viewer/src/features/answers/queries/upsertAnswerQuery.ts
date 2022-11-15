import { Answer } from 'models'
import { sendRequest } from 'utils'

export const upsertAnswerQuery = async (
  answer: Answer & { resultId: string } & { uploadedFiles?: boolean }
) =>
  sendRequest<Answer>({
    url: `/api/typebots/t/results/r/answers`,
    method: 'PUT',
    body: answer,
  })
