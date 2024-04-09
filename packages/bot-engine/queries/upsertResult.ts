import prisma from '@typebot.io/lib/prisma'
import { Prisma } from '@typebot.io/prisma'
import { TypebotInSession } from '@typebot.io/schemas'
import { filterVariablesWithValues } from '@typebot.io/variables/filterVariablesWithValues'

type Props = {
  resultId: string
  typebot: TypebotInSession
  hasStarted: boolean
  isCompleted: boolean
}
export const upsertResult = ({
  resultId,
  typebot,
  hasStarted,
  isCompleted,
}: Props): Prisma.PrismaPromise<any> => {
  const variablesWithValue = filterVariablesWithValues(typebot.variables)
  return prisma.result.upsert({
    where: { id: resultId },
    update: {
      isCompleted: isCompleted ? true : undefined,
      hasStarted,
      variables: variablesWithValue,
    },
    create: {
      id: resultId,
      typebotId: typebot.id,
      isCompleted: isCompleted ? true : false,
      hasStarted,
      variables: variablesWithValue,
    },
    select: { id: true },
  })
}
