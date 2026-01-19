import { ORPCError } from "@orpc/server";
import gentleRateLimiter from "@typebot.io/auth/lib/gentleRateLimiter";
import { getSeatsLimit } from "@typebot.io/billing/helpers/getSeatsLimit";
import { sendWorkspaceMemberInvitationEmail } from "@typebot.io/emails/transactional/WorkspaceMemberInvitationEmail";
import { env } from "@typebot.io/env";
import prisma from "@typebot.io/prisma";
import { WorkspaceRole } from "@typebot.io/prisma/enum";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";

export const createWorkspaceInvitationInputSchema = z.object({
  workspaceId: z.string(),
  email: z.string().email(),
  type: z.nativeEnum(WorkspaceRole),
});

export const handleCreateWorkspaceInvitation = async ({
  input: { workspaceId, email, type },
  context: { user },
}: {
  input: z.infer<typeof createWorkspaceInvitationInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  if (gentleRateLimiter) {
    const { success } = await gentleRateLimiter.limit(user.id);
    if (!success) throw new ORPCError("TOO_MANY_REQUESTS");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
    },
  });

  if (!workspace)
    throw new ORPCError("FORBIDDEN", {
      message: "You don't have permission to invite members to this workspace",
    });

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
    throw new ORPCError("BAD_REQUEST", { message: "Seats limit reached" });

  if (existingUser) {
    await prisma.memberInWorkspace.create({
      data: {
        role: type,
        workspaceId,
        userId: existingUser.id,
      },
    });

    await sendWorkspaceMemberInvitationEmail({
      workspaceName: workspace.name,
      guestEmail: email,
      url: `${env.NEXTAUTH_URL}/typebots?workspaceId=${workspace.id}`,
      hostEmail: user.email ?? "",
    });

    return {
      member: {
        userId: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: type,
        workspaceId,
      },
    };
  }

  const invitation = await prisma.workspaceInvitation.create({
    data: { email, type, workspaceId },
  });

  await sendWorkspaceMemberInvitationEmail({
    workspaceName: workspace.name,
    guestEmail: email,
    url: `${env.NEXTAUTH_URL}/typebots?workspaceId=${workspace.id}`,
    hostEmail: user.email ?? "",
  });

  return { invitation };
};
