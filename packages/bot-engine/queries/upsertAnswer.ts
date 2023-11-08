import prisma from '@typebot.io/lib/prisma'
import { Prisma } from '@typebot.io/prisma'
import { InputBlock, SessionState } from '@typebot.io/schemas'

type Props = {
  answer: Omit<Prisma.AnswerUncheckedCreateInput, 'resultId'>
  reply: string
  state: SessionState
}
export const upsertAnswer = async ({ answer, state }: Props) => {
  const resultId = state.typebotsQueue[0].resultId
  if (!resultId) return
  const where = {
    resultId,
    blockId: answer.blockId,
    groupId: answer.groupId,
  }
  const existingAnswer = await prisma.answer.findUnique({
    where: {
      resultId_blockId_groupId: where,
    },
    select: { resultId: true },
  })
  if (existingAnswer)
    return prisma.answer.updateMany({
      where,
      data: {
        content: answer.content,
      },
    })
  return prisma.answer.createMany({
    data: [{ ...answer, resultId }],
  })
}
