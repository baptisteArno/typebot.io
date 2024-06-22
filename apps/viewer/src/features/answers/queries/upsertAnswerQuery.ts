import { Answer, AnswerInput } from '@sniper.io/schemas'
import { sendRequest } from '@sniper.io/lib'

export const upsertAnswerQuery = async (
  answer: AnswerInput & { resultId: string } & { uploadedFiles?: boolean }
) =>
  sendRequest<Answer>({
    url: `/api/snipers/t/results/r/answers`,
    method: 'PUT',
    body: answer,
  })
