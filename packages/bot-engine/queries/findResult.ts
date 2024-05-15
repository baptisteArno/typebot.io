import prisma from '@typebot.io/lib/prisma'
import { Answer, Result } from '@typebot.io/schemas'

type Props = {
  id: string
}
export const findResult = async ({ id }: Props) => {
  const { answers, answersV2, ...result } =
    (await prisma.result.findFirst({
      where: { id, isArchived: { not: true } },
      select: {
        id: true,
        variables: true,
        hasStarted: true,
        answers: {
          select: {
            content: true,
            blockId: true,
          },
        },
        answersV2: {
          select: {
            content: true,
            blockId: true,
          },
        },
      },
    })) ?? {}
  if (!result) return null
  return {
    ...result,
    answers: (answersV2 ?? []).concat(answers ?? []),
  } as Pick<Result, 'id' | 'variables' | 'hasStarted'> & {
    answers: Pick<Answer, 'content' | 'blockId'>[]
  }
}
