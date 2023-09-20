import prisma from '@typebot.io/lib/prisma'
import { Prisma } from '@typebot.io/prisma'
import { InputBlock, SessionState } from '@typebot.io/schemas'

type Props = {
  answer: Omit<Prisma.AnswerUncheckedCreateInput, 'resultId'>
  block: InputBlock
  reply: string
  itemId?: string
  state: SessionState
}
export const upsertAnswer = async ({ answer, block, state }: Props) => {
  const resultId = state.typebotsQueue[0].resultId
  if (!resultId) return
  const where = {
    resultId,
    blockId: block.id,
    groupId: block.groupId,
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
        itemId: answer.itemId,
      },
    })
  return prisma.answer.createMany({
    data: [{ ...answer, resultId }],
  })
}
