import { getAuthenticatedUser } from "@/features/auth/helpers/getAuthenticatedUser";
import {
  canReadTypebots,
  canWriteTypebots,
  isUniqueConstraintError,
} from "@/helpers/databaseRules";
import { sendGuestInvitationEmail } from "@typebot.io/emails/emails/GuestInvitationEmail";
import { env } from "@typebot.io/env";
import {
  badRequest,
  forbidden,
  methodNotAllowed,
  notAuthenticated,
} from "@typebot.io/lib/api/utils";
import prisma from "@typebot.io/prisma";
import { type CollaborationType, WorkspaceRole } from "@typebot.io/prisma/enum";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return notAuthenticated(res);
  const typebotId = req.query.typebotId as string | undefined;
  if (!typebotId) return badRequest(res);
  if (req.method === "GET") {
    const invitations = await prisma.invitation.findMany({
      where: { typebotId, typebot: canReadTypebots(typebotId, user) },
    });
    return res.send({
      invitations,
    });
  }
  if (req.method === "POST") {
    const typebot = await prisma.typebot.findFirst({
      where: canWriteTypebots(typebotId, user),
      include: { workspace: { select: { name: true } } },
    });
    if (!typebot || !typebot.workspaceId) return forbidden(res);
    const { email, type } =
      (req.body as
        | { email: string | undefined; type: CollaborationType | undefined }
        | undefined) ?? {};
    if (!email || !type) return badRequest(res);
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });
    if (existingUser) {
      try {
        await prisma.collaboratorsOnTypebots.create({
          data: {
            type,
            typebotId,
            userId: existingUser.id,
          },
        });
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          return res.status(400).send({
            message: "User already has access to this typebot.",
          });
        }
        throw error;
      }

      await prisma.memberInWorkspace.upsert({
        where: {
          userId_workspaceId: {
            userId: existingUser.id,
            workspaceId: typebot.workspaceId,
          },
        },
        create: {
          role: WorkspaceRole.GUEST,
          userId: existingUser.id,
          workspaceId: typebot.workspaceId,
        },
        update: {},
      });
    } else
      await prisma.invitation.create({
        data: { email: email.toLowerCase().trim(), type, typebotId },
      });
    if (!env.NEXT_PUBLIC_E2E_TEST)
      await sendGuestInvitationEmail({
        to: email,
        hostEmail: user.email ?? "",
        url: `${env.NEXTAUTH_URL}/typebots?workspaceId=${typebot.workspaceId}`,
        guestEmail: email.toLowerCase(),
        typebotName: typebot.name,
        workspaceName: typebot.workspace?.name ?? "",
      });
    return res.send({
      message: "success",
    });
  }
  methodNotAllowed(res);
};

export default handler;
