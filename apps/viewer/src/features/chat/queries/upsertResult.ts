import prisma from '@/lib/prisma'
import { SessionState } from '@typebot.io/schemas'

type Props = {
  state: SessionState
  isCompleted: boolean
}
export const upsertResult = async ({ state, isCompleted }: Props) => {
  const existingResult = await prisma.result.findUnique({
    where: { id: state.result.id },
    select: { id: true },
  })
  if (existingResult) {
    return prisma.result.updateMany({
      where: { id: state.result.id },
      data: {
        isCompleted: isCompleted ? true : undefined,
        hasStarted: state.result.answers.length > 0 ? true : undefined,
        variables: state.result.variables,
      },
    })
  }
  return prisma.result.createMany({
    data: [
      {
        id: state.result.id,
        typebotId: state.typebot.id,
        isCompleted: isCompleted ? true : false,
        hasStarted: state.result.answers.length > 0 ? true : undefined,
        variables: state.result.variables,
      },
    ],
  })
}
