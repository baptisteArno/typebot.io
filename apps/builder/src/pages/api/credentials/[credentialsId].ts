import { getAuthenticatedUser } from "@/features/auth/helpers/getAuthenticatedUser";
import {
  badRequest,
  methodNotAllowed,
  notAuthenticated,
} from "@typebot.io/lib/api/utils";
import prisma from "@typebot.io/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return notAuthenticated(res);
  const workspaceId = req.query.workspaceId as string | undefined;
  if (!workspaceId) return badRequest(res);
  if (req.method === "DELETE") {
    const credentialsId = req.query.credentialsId as string | undefined;
    const credentials = await prisma.credentials.deleteMany({
      where: {
        id: credentialsId,
        workspace: { id: workspaceId, members: { some: { userId: user.id } } },
      },
    });
    return res.send({ credentials });
  }
  return methodNotAllowed(res);
};

export default handler;
