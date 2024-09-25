import prisma from "@typebot.io/prisma";
import type { Prisma } from "@typebot.io/prisma/types";

export const saveVisitedEdges = (visitedEdges: Prisma.VisitedEdge[]) =>
  prisma.visitedEdge.createMany({
    data: visitedEdges,
    skipDuplicates: true,
  });
