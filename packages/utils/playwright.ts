import { PrismaClient } from 'db'

type CreateFakeResultsProps = {
  typebotId: string
  count: number
  idPrefix?: string
  isChronological?: boolean
  fakeStorage?: number
}

export const injectFakeResults =
  (prisma: PrismaClient) =>
  async ({
    count,
    idPrefix = '',
    typebotId,
    isChronological = true,
    fakeStorage,
  }: CreateFakeResultsProps) => {
    await prisma.result.createMany({
      data: [
        ...Array.from(Array(count)).map((_, idx) => {
          const today = new Date()
          const rand = Math.random()
          return {
            id: `${idPrefix}-result${idx}`,
            typebotId,
            createdAt: isChronological
              ? new Date(
                  today.setTime(today.getTime() + 1000 * 60 * 60 * 24 * idx)
                )
              : new Date(),
            isCompleted: rand > 0.5,
            hasStarted: true,
          }
        }),
      ],
    })
    return createAnswers(prisma)({ idPrefix, fakeStorage, count })
  }

const createAnswers =
  (prisma: PrismaClient) =>
  ({
    count,
    idPrefix,
    fakeStorage,
  }: Pick<CreateFakeResultsProps, 'fakeStorage' | 'idPrefix' | 'count'>) => {
    return prisma.answer.createMany({
      data: [
        ...Array.from(Array(count)).map((_, idx) => ({
          resultId: `${idPrefix}-result${idx}`,
          content: `content${idx}`,
          blockId: 'block1',
          groupId: 'block1',
          storageUsed: fakeStorage ? Math.round(fakeStorage / count) : null,
        })),
      ],
    })
  }
