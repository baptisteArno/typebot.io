import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { canEditGuests } from "@/helpers/databaseRules";

export const deleteCollaboratorInputSchema = z.object({
  typebotId: z.string(),
  userId: z.string(),
});

export const handleDeleteCollaborator = async ({
  input: { typebotId, userId },
  context: { user },
}: {
  input: z.infer<typeof deleteCollaboratorInputSchema>;
  context: { user: Pick<User, "id"> };
}) => {
  await prisma.collaboratorsOnTypebots.deleteMany({
    where: { userId, typebot: canEditGuests(user, typebotId) },
  });
  return { message: "success" };
};
