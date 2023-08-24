import prisma from '@/lib/prisma'
import { getDefinedVariables } from '@typebot.io/lib/results'
import { TypebotInSession } from '@typebot.io/schemas'

type Props = {
  resultId: string
  typebot: TypebotInSession
  hasStarted: boolean
  isCompleted: boolean
}
export const createResult = async ({
  resultId,
  typebot,
  hasStarted,
  isCompleted,
}: Props) =>
  prisma.result.createMany({
    data: [
      {
        id: resultId,
        typebotId: typebot.id,
        isCompleted: isCompleted ? true : false,
        hasStarted,
        variables: getDefinedVariables(typebot.variables),
      },
    ],
  })
