import prisma from '@typebot.io/lib/prisma'
import { VisitedEdge } from '@typebot.io/prisma'

export const saveVisitedEdges = (visitedEdges: VisitedEdge[]) =>
  prisma.visitedEdge.createMany({
    data: visitedEdges,
    skipDuplicates: true,
  })
