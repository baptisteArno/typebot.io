import prisma from '@/lib/prisma'
import { isNotDefined } from '@typebot.io/lib'
import { Prisma } from '@typebot.io/prisma'
import { InputBlock, InputBlockType, SessionState } from '@typebot.io/schemas'
import got from 'got'

type Props = {
  answer: Omit<Prisma.AnswerUncheckedCreateInput, 'resultId'>
  block: InputBlock
  reply: string
  itemId?: string
  state: SessionState
}
export const upsertAnswer = async ({ answer, reply, block, state }: Props) => {
  const resultId = state.typebotsQueue[0].resultId
  if (!resultId) return
  if (reply.includes('http') && block.type === InputBlockType.FILE) {
    answer.storageUsed = await computeStorageUsed(reply)
  }
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
        storageUsed: answer.storageUsed,
        itemId: answer.itemId,
      },
    })
  return prisma.answer.createMany({
    data: [{ ...answer, resultId }],
  })
}

const computeStorageUsed = async (reply: string) => {
  let storageUsed = 0
  const fileUrls = reply.split(', ')
  const hasReachedStorageLimit = fileUrls[0] === null
  if (!hasReachedStorageLimit) {
    for (const url of fileUrls) {
      const { headers } = await got(url)
      const size = headers['content-length']
      if (isNotDefined(size)) continue
      storageUsed += parseInt(size, 10)
    }
  }
  return storageUsed
}
