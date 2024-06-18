import prisma from '@sniper.io/lib/prisma'
import { Prisma } from '@sniper.io/prisma'
import { SessionState } from '@sniper.io/schemas'

type Props = {
  answer: Omit<Prisma.AnswerV2CreateManyInput, 'resultId'>
  reply: string
  state: SessionState
}
export const saveAnswer = async ({ answer, state }: Props) => {
  const resultId = state.snipersQueue[0].resultId
  if (!resultId) return
  return prisma.answerV2.createMany({
    data: [{ ...answer, resultId }],
  })
}
