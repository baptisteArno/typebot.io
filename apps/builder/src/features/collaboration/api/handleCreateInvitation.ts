import { ORPCError } from "@orpc/server";
import gentleRateLimiter from "@typebot.io/auth/lib/gentleRateLimiter";
import { sendGuestInvitationEmail } from "@typebot.io/emails/transactional/GuestInvitationEmail";
import { env } from "@typebot.io/env";
import prisma from "@typebot.io/prisma";
import { CollaborationType, WorkspaceRole } from "@typebot.io/prisma/enum";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import {
  canWriteTypebots,
  isUniqueConstraintError,
} from "@/helpers/databaseRules";

export const createInvitationInputSchema = z.object({
  typebotId: z.string(),
  email: z.string().email(),
  type: z.nativeEnum(CollaborationType),
});

export const handleCreateInvitation = async ({
  input: { typebotId, email, type },
  context: { user },
}: {
  input: z.infer<typeof createInvitationInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  if (gentleRateLimiter) {
    const { success } = await gentleRateLimiter.limit(user.id);
    if (!success) throw new ORPCError("TOO_MANY_REQUESTS");
  }
  const typebot = await prisma.typebot.findFirst({
    where: canWriteTypebots(typebotId, user),
    include: { workspace: { select: { name: true } } },
  });

  if (!typebot || !typebot.workspaceId)
    throw new ORPCError("FORBIDDEN", {
      message:
        "You don't have permission to invite collaborators to this typebot",
    });

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
        throw new ORPCError("BAD_REQUEST", {
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
  } else {
    await prisma.invitation.create({
      data: { email: email.toLowerCase().trim(), type, typebotId },
    });
  }

  await sendGuestInvitationEmail({
    hostEmail: user.email ?? "",
    url: `${env.NEXTAUTH_URL}/typebots?workspaceId=${typebot.workspaceId}`,
    guestEmail: email.toLowerCase(),
    typebotName: typebot.name,
    workspaceName: typebot.workspace?.name ?? "",
  });

  return { message: "success" };
};
