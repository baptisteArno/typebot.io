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
    const workspaceId = req.query.workspaceId as string;
    const memberId = req.query.id as string;
    const updates = req.body as Partial<Prisma.MemberInWorkspace>;
    const member = await prisma.memberInWorkspace.updateMany({
      where: {
        userId: memberId,
        workspace: {
          id: workspaceId,
          members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
        },
      },
      data: { role: updates.role },
    });
    return res.status(200).json({
      member,
    });
  }
  if (req.method === "DELETE") {
    const workspaceId = req.query.workspaceId as string;
    const memberId = req.query.id as string;
    const member = await prisma.memberInWorkspace.deleteMany({
      where: {
        userId: memberId,
        workspace: {
          id: workspaceId,
          members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
        },
      },
    });
    return res.status(200).json({
      member,
    });
  }
  methodNotAllowed(res);
};

export default handler;
