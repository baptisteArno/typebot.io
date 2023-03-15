import { Answer, AnswerInput } from '@typebot.io/schemas'
import { sendRequest } from '@typebot.io/lib'

export const upsertAnswerQuery = async (
  answer: AnswerInput & { resultId: string } & { uploadedFiles?: boolean }
) =>
  sendRequest<Answer>({
    url: `/api/typebots/t/results/r/answers`,
    method: 'PUT',
    body: answer,
  })
