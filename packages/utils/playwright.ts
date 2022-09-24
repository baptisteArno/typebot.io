import { PrismaClient } from 'db'
import cuid from 'cuid'

type CreateFakeResultsProps = {
  typebotId: string
  count: number
  customResultIdPrefix?: string
  isChronological?: boolean
  fakeStorage?: number
}

export const injectFakeResults =
  (prisma: PrismaClient) =>
  async ({
    count,
    customResultIdPrefix,
    typebotId,
    isChronological,
    fakeStorage,
  }: CreateFakeResultsProps) => {
    const resultIdPrefix = customResultIdPrefix ?? cuid()
    await prisma.result.createMany({
      data: [
        ...Array.from(Array(count)).map((_, idx) => {
          const today = new Date()
          const rand = Math.random()
          return {
            id: `${resultIdPrefix}-result${idx}`,
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
    return createAnswers(prisma)({ fakeStorage, resultIdPrefix, count })
  }

const createAnswers =
  (prisma: PrismaClient) =>
  ({
    count,
    resultIdPrefix,
    fakeStorage,
  }: { resultIdPrefix: string } & Pick<
    CreateFakeResultsProps,
    'fakeStorage' | 'count'
  >) => {
    return prisma.answer.createMany({
      data: [
        ...Array.from(Array(count)).map((_, idx) => ({
          resultId: `${resultIdPrefix}-result${idx}`,
          content: `content${idx}`,
          blockId: 'block1',
          groupId: 'block1',
          storageUsed: fakeStorage ? Math.round(fakeStorage / count) : null,
        })),
      ],
    })
  }
