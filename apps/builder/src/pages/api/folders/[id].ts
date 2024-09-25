import { getAuthenticatedUser } from "@/features/auth/helpers/getAuthenticatedUser";
import { methodNotAllowed, notAuthenticated } from "@typebot.io/lib/api/utils";
import prisma from "@typebot.io/prisma";
import type { Prisma } from "@typebot.io/prisma/types";
import type { NextApiRequest, NextApiResponse } from "next";

// TODO: Delete as it has been migrated to TRPC endpoints
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return notAuthenticated(res);

  const id = req.query.id as string;
  if (req.method === "GET") {
    const folder = await prisma.dashboardFolder.findFirst({
      where: {
        id,
        workspace: { members: { some: { userId: user.id } } },
      },
    });
    return res.send({ folder });
  }
  if (req.method === "DELETE") {
    const folders = await prisma.dashboardFolder.deleteMany({
      where: { id, workspace: { members: { some: { userId: user.id } } } },
    });
    return res.send({ folders });
  }
  if (req.method === "PATCH") {
    const data = (
      typeof req.body === "string" ? JSON.parse(req.body) : req.body
    ) as Partial<Prisma.DashboardFolder>;
    const folders = await prisma.dashboardFolder.updateMany({
      where: {
        id,
        workspace: { members: { some: { userId: user.id } } },
      },
      data,
    });
    return res.send({ typebots: folders });
  }
  return methodNotAllowed(res);
};

export default handler;
