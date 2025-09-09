import prisma from "@typebot.io/prisma";
import { clientUserSchema, updateUserSchema } from "@typebot.io/user/schemas";
import { z } from "@typebot.io/zod";
import { authenticatedProcedure } from "@/helpers/server/trpc";

export const updateUser = authenticatedProcedure
  .input(
    z.object({
      updates: updateUserSchema.partial(),
    }),
  )
  .output(clientUserSchema)
  .meta({
    openapi: {
      method: "PATCH",
      path: "/v1/users/me",
      tags: ["User"],
      protect: true,
    },
  })
  .mutation(async ({ ctx: { user }, input: { updates } }) => {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...updates,
        onboardingCategories: updates.onboardingCategories,
        displayedInAppNotifications:
          updates.displayedInAppNotifications ?? undefined,
        groupTitlesAutoGeneration:
          updates.groupTitlesAutoGeneration ?? undefined,
      },
    });
    return clientUserSchema.parse(updatedUser);
  });
