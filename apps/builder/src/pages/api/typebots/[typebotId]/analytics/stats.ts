import { getAuthenticatedUser } from "@/features/auth/helpers/getAuthenticatedUser";
import { canReadTypebots } from "@/helpers/databaseRules";
import { methodNotAllowed, notAuthenticated } from "@typebot.io/lib/api/utils";
import prisma from "@typebot.io/prisma";
import type { Stats } from "@typebot.io/results/schemas/answers";
import type { NextApiRequest, NextApiResponse } from "next";

// TODO: Delete, as it has been migrated to tRPC
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return notAuthenticated(res);
  if (req.method === "GET") {
    const typebotId = req.query.typebotId as string;

    const typebot = await prisma.typebot.findFirst({
      where: canReadTypebots(typebotId, user),
      select: { id: true },
    });

    if (!typebot) return res.status(404).send({ message: "Typebot not found" });

    const [totalViews, totalStarts, totalCompleted] = await prisma.$transaction(
      [
        prisma.result.count({
          where: {
            typebotId: typebot.id,
            isArchived: false,
          },
        }),
        prisma.result.count({
          where: {
            typebotId: typebot.id,
            isArchived: false,
            hasStarted: true,
          },
        }),
        prisma.result.count({
          where: {
            typebotId: typebot.id,
            isArchived: false,
            isCompleted: true,
          },
        }),
      ],
    );

    const stats: Stats = {
      totalViews,
      totalStarts,
      totalCompleted,
    };
    return res.status(200).send({ stats });
  }
  return methodNotAllowed(res);
};

export default handler;
