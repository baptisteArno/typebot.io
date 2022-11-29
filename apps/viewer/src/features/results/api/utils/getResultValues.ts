import prisma from '@/lib/prisma'
import { ResultValues } from 'models'

export const getResultValues = async (resultId: string) =>
  (await prisma.result.findUnique({
    where: { id: resultId },
    include: { answers: true },
  })) as ResultValues | null
