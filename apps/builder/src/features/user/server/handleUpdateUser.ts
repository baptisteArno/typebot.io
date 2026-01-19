import prisma from "@typebot.io/prisma";
import {
  clientUserSchema,
  type User,
  updateUserSchema,
} from "@typebot.io/user/schemas";
import { z } from "zod";

export const updateUserInputSchema = z.object({
  updates: updateUserSchema.partial(),
});

export const handleUpdateUser = async ({
  context: { user },
  input: { updates },
}: {
  context: { user: Pick<User, "id"> };
  input: z.infer<typeof updateUserInputSchema>;
}) => {
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...updates,
      onboardingCategories: updates.onboardingCategories,
      displayedInAppNotifications:
        updates.displayedInAppNotifications ?? undefined,
      groupTitlesAutoGeneration: updates.groupTitlesAutoGeneration ?? undefined,
    },
  });
  return clientUserSchema.parse(updatedUser);
};
