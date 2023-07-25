import prisma from '@/lib/prisma'

type Props = {
  id: string
}
export const findResult = ({ id }: Props) =>
  prisma.result.findFirst({
    where: { id },
    select: {
      id: true,
      variables: true,
      answers: { select: { blockId: true, variableId: true, content: true } },
    },
  })
