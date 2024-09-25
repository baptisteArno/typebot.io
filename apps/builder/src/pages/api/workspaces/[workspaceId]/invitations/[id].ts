import { getAuthenticatedUser } from "@/features/auth/helpers/getAuthenticatedUser";
import { methodNotAllowed, notAuthenticated } from "@typebot.io/lib/api/utils";
import prisma from "@typebot.io/prisma";
import { WorkspaceRole } from "@typebot.io/prisma/enum";
import type { Prisma } from "@typebot.io/prisma/types";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return notAuthenticated(res);
  if (req.method === "PATCH") {
    const data = req.body as Omit<Prisma.WorkspaceInvitation, "createdAt">;
    const invitation = await prisma.workspaceInvitation.updateMany({
      where: {
        id: data.id,
        workspace: {
          members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
        },
      },
      data,
    });
    return res.send({ invitation });
  }
  if (req.method === "DELETE") {
    const id = req.query.id as string;
    await prisma.workspaceInvitation.deleteMany({
      where: {
        id,
        workspace: {
          members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
        },
      },
    });
    return res.send({ message: "success" });
  }
  methodNotAllowed(res);
};

export default handler;
