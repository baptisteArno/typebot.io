import prisma from '@sniper.io/lib/prisma'
import { VisitedEdge } from '@sniper.io/prisma'

export const saveVisitedEdges = (visitedEdges: VisitedEdge[]) =>
  prisma.visitedEdge.createMany({
    data: visitedEdges,
    skipDuplicates: true,
  })
