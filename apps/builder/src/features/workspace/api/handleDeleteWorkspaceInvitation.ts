import prisma from "@typebot.io/prisma";
import { WorkspaceRole } from "@typebot.io/prisma/enum";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";

export const deleteWorkspaceInvitationInputSchema = z.object({
  id: z.string(),
});

export const handleDeleteWorkspaceInvitation = async ({
  input: { id },
  context: { user },
}: {
  input: z.infer<typeof deleteWorkspaceInvitationInputSchema>;
  context: { user: Pick<User, "id"> };
}) => {
  await prisma.workspaceInvitation.deleteMany({
    where: {
      id,
      workspace: {
        members: { some: { userId: user.id, role: WorkspaceRole.ADMIN } },
      },
    },
  });
  return { message: "success" as const };
};
