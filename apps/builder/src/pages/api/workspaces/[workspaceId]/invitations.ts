import { getAuthenticatedUser } from "@/features/auth/helpers/getAuthenticatedUser";
import { getSeatsLimit } from "@typebot.io/billing/helpers/getSeatsLimit";
import { sendWorkspaceMemberInvitationEmail } from "@typebot.io/emails/emails/WorkspaceMemberInvitationEmail";
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

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return notAuthenticated(res);
  if (req.method === "POST") {
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
          where: { workspaceId: workspace.id },
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
      if (!env.NEXT_PUBLIC_E2E_TEST)
        await sendWorkspaceMemberInvitationEmail({
          to: data.email,
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
      if (!env.NEXT_PUBLIC_E2E_TEST)
        await sendWorkspaceMemberInvitationEmail({
          to: data.email,
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
