import { getAuthenticatedUser } from "@/features/auth/helpers/getAuthenticatedUser";
import {
  badRequest,
  methodNotAllowed,
  notAuthenticated,
} from "@typebot.io/lib/api/utils";
import prisma from "@typebot.io/prisma";
import { WorkspaceRole } from "@typebot.io/prisma/enum";
import type { Prisma } from "@typebot.io/prisma/types";
import type { NextApiRequest, NextApiResponse } from "next";

// TODO: Delete as it has been migrated to TRPC endpoints
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return notAuthenticated(res);

  const parentFolderId = req.query.parentId
    ? req.query.parentId.toString()
    : null;

  if (req.method === "GET") {
    const workspaceId = req.query.workspaceId as string | undefined;
    if (!workspaceId) return badRequest(res);
    const folders = await prisma.dashboardFolder.findMany({
      where: {
        AND: [
          {
            parentFolderId,
            workspaceId: workspaceId,
          },
          {
            workspace: {
              members: {
                some: {
                  userId: user.id,
                  role: { not: WorkspaceRole.GUEST },
                },
              },
            },
          },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
    return res.send({ folders });
  }
  if (req.method === "POST") {
    const data = (
      typeof req.body === "string" ? JSON.parse(req.body) : req.body
    ) as Pick<Prisma.DashboardFolder, "parentFolderId" | "workspaceId">;
    const folder = await prisma.dashboardFolder.create({
      data: { ...data, name: "New folder" },
    });
    return res.send(folder);
  }
  return methodNotAllowed(res);
};

export default handler;
