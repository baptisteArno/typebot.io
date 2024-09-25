import { getAuthenticatedUser } from "@/features/auth/helpers/getAuthenticatedUser";
import { canReadTypebots } from "@/helpers/databaseRules";
import { methodNotAllowed, notAuthenticated } from "@typebot.io/lib/api/utils";
import prisma from "@typebot.io/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return notAuthenticated(res);
  const typebotId = req.query.typebotId as string;
  if (req.method === "GET") {
    const collaborators = await prisma.collaboratorsOnTypebots.findMany({
      where: { typebot: canReadTypebots(typebotId, user) },
      include: { user: { select: { name: true, image: true, email: true } } },
    });
    return res.send({
      collaborators,
    });
  }
  methodNotAllowed(res);
};

export default handler;
