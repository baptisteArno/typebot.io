import prisma from '@sniper.io/lib/prisma'
import { SniperInSession } from '@sniper.io/schemas'

type Props = {
  resultId: string
  sniper: SniperInSession
  hasStarted: boolean
  isCompleted: boolean
}

export const createResultIfNotExist = async ({
  resultId,
  sniper,
  hasStarted,
  isCompleted,
}: Props) => {
  const existingResult = await prisma.result.findUnique({
    where: { id: resultId },
    select: { id: true },
  })
  if (existingResult) return
  return prisma.result.createMany({
    data: [
      {
        id: resultId,
        sniperId: sniper.id,
        isCompleted: isCompleted ? true : false,
        hasStarted,
        variables: sniper.variables,
      },
    ],
  })
}
