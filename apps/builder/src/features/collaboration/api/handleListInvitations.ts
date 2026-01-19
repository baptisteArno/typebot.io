import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { canReadTypebots } from "@/helpers/databaseRules";

export const listInvitationsInputSchema = z.object({
  typebotId: z.string(),
});

export const handleListInvitations = async ({
  input: { typebotId },
  context: { user },
}: {
  input: z.infer<typeof listInvitationsInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  const invitations = await prisma.invitation.findMany({
    where: { typebotId, typebot: canReadTypebots(typebotId, user) },
  });
  return { invitations };
};
