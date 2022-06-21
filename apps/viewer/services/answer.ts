import { Answer } from 'models'
import { sendRequest } from 'utils'

export const upsertAnswer = async (
  answer: Answer & { resultId: string } & { uploadedFiles?: boolean }
) =>
  sendRequest<Answer>({
    url: `/api/typebots/t/results/r/answers`,
    method: 'PUT',
    body: answer,
  })
