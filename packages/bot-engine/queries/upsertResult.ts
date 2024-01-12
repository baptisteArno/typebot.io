import prisma from '@typebot.io/lib/prisma'
import { TypebotInSession } from '@typebot.io/schemas'
import { filterVariablesWithValues } from '@typebot.io/variables/filterVariablesWithValues'

type Props = {
  resultId: string
  typebot: TypebotInSession
  hasStarted: boolean
  isCompleted: boolean
}
export const upsertResult = async ({
  resultId,
  typebot,
  hasStarted,
  isCompleted,
}: Props) => {
  const existingResult = await prisma.result.findUnique({
    where: { id: resultId },
    select: { id: true },
  })
  const variablesWithValue = filterVariablesWithValues(typebot.variables)

  if (existingResult) {
    return prisma.result.updateMany({
      where: { id: resultId },
      data: {
        isCompleted: isCompleted ? true : undefined,
        hasStarted,
        variables: variablesWithValue,
      },
    })
  }
  return prisma.result.createMany({
    data: [
      {
        id: resultId,
        typebotId: typebot.id,
        isCompleted: isCompleted ? true : false,
        hasStarted,
        variables: variablesWithValue,
      },
    ],
  })
}
