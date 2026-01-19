import prisma from "@typebot.io/prisma";
import { CollaborationType } from "@typebot.io/prisma/enum";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { canEditGuests } from "@/helpers/databaseRules";

export const updateInvitationInputSchema = z.object({
  typebotId: z.string(),
  email: z.string(),
  type: z.nativeEnum(CollaborationType),
});

export const handleUpdateInvitation = async ({
  input: { typebotId, email, type },
  context: { user },
}: {
  input: z.infer<typeof updateInvitationInputSchema>;
  context: { user: Pick<User, "id"> };
}) => {
  await prisma.invitation.updateMany({
    where: { email, typebot: canEditGuests(user, typebotId) },
    data: { type },
  });
  return { message: "success" };
};
