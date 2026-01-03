import { getSeatsLimit } from "@typebot.io/billing/helpers/getSeatsLimit";
import { sendWorkspaceMemberInvitationEmail } from "@typebot.io/emails/transactional/WorkspaceMemberInvitationEmail";
import { env } from "@typebot.io/env";
import {
  forbidden,
  methodNotAllowed,
  notAuthenticated,
} from "@typebot.io/lib/api/utils";
import prisma from "@typebot.io/prisma";
import { WorkspaceRole } from "@typebot.io/prisma/enum";
import type { Prisma } from "@typebot.io/prisma/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthenticatedUser } from "@/features/auth/helpers/getAuthenticatedUser";
import gentleRateLimiter from "@/features/auth/lib/gentleRateLimiter";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return notAuthenticated(res);
  if (req.method === "POST") {
    if (gentleRateLimiter) {
      const { success } = await gentleRateLimiter.limit(user.id);
      if (!success) return res.status(429).send("Too many requests");
    }

    const data = req.body as Omit<
      Prisma.WorkspaceInvitation,
      "id" | "createdAt"
    >;
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: data.workspaceId,
        members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
      },
    });
    if (!workspace) return forbidden(res);

    const [existingMembersCount, existingInvitationsCount] =
      await prisma.$transaction([
        prisma.memberInWorkspace.count({
          where: {
            workspaceId: workspace.id,
            role: { not: WorkspaceRole.GUEST },
          },
        }),
        prisma.workspaceInvitation.count({
          where: { workspaceId: workspace.id },
        }),
      ]);
    const seatsLimit = getSeatsLimit(workspace);
    if (
      seatsLimit !== "inf" &&
      seatsLimit <= existingMembersCount + existingInvitationsCount
    )
      return res.status(400).send("Seats limit reached");
    if (existingUser) {
      await prisma.memberInWorkspace.create({
        data: {
          role: data.type,
          workspaceId: data.workspaceId,
          userId: existingUser.id,
        },
      });
      await sendWorkspaceMemberInvitationEmail({
        workspaceName: workspace.name,
        guestEmail: data.email,
        url: `${env.NEXTAUTH_URL}/typebots?workspaceId=${workspace.id}`,
        hostEmail: user.email ?? "",
      });
      return res.send({
        member: {
          userId: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          role: data.type,
          workspaceId: data.workspaceId,
        },
      });
    } else {
      const invitation = await prisma.workspaceInvitation.create({ data });
      await sendWorkspaceMemberInvitationEmail({
        workspaceName: workspace.name,
        guestEmail: data.email,
        url: `${env.NEXTAUTH_URL}/typebots?workspaceId=${workspace.id}`,
        hostEmail: user.email ?? "",
      });
      return res.send({ invitation });
    }
  }
  methodNotAllowed(res);
};

export default handler;
