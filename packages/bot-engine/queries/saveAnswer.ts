import prisma from '@typebot.io/lib/prisma'
import { Prisma } from '@typebot.io/prisma'
import { SessionState } from '@typebot.io/schemas'

type Props = {
  answer: Omit<Prisma.AnswerV2CreateManyInput, 'resultId'>
  state: SessionState
}
export const saveAnswer = async ({ answer, state }: Props) => {
  const resultId = state.typebotsQueue[0].resultId
  if (!resultId) return
  return prisma.answerV2.createMany({
    data: [{ ...answer, resultId }],
  })
}
