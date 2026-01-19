import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { canEditGuests } from "@/helpers/databaseRules";

export const deleteInvitationInputSchema = z.object({
  typebotId: z.string(),
  email: z.string(),
});

export const handleDeleteInvitation = async ({
  input: { typebotId, email },
  context: { user },
}: {
  input: z.infer<typeof deleteInvitationInputSchema>;
  context: { user: Pick<User, "id"> };
}) => {
  await prisma.invitation.deleteMany({
    where: {
      email,
      typebot: canEditGuests(user, typebotId),
    },
  });
  return { message: "success" };
};
