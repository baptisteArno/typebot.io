import prisma from '@/lib/prisma'
import { Answer, Result } from '@typebot.io/schemas'

type Props = {
  id: string
}
export const findResult = ({ id }: Props) =>
  prisma.result.findFirst({
    where: { id },
    select: {
      id: true,
      variables: true,
      hasStarted: true,
      answers: {
        select: {
          content: true,
          blockId: true,
          variableId: true,
        },
      },
    },
  }) as Promise<
    | (Pick<Result, 'id' | 'variables' | 'hasStarted'> & {
        answers: Pick<Answer, 'content' | 'blockId' | 'variableId'>[]
      })
    | null
  >
