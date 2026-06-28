import prisma from "@typebot.io/prisma";
import {
  clientUserSchema,
  type User,
  updateUserSchema,
} from "@typebot.io/user/schemas";
import { z } from "zod";

const defaultMySqlStringMaxLength = 191;

const mysqlUpdateUserInputFieldsSchema = updateUserSchema.extend({
  name: z.string().max(255).nullable(),
  image: z.string().max(1000).nullable(),
  company: z.string().max(defaultMySqlStringMaxLength).nullable(),
  referral: z.string().max(defaultMySqlStringMaxLength).nullable(),
  preferredAppAppearance: z
    .string()
    .max(defaultMySqlStringMaxLength)
    .nullable(),
  preferredLanguage: z.string().max(10).nullable(),
});

export const updateUserInputSchema = z.object({
  updates: (process.env.DATABASE_URL?.startsWith("mysql://")
    ? mysqlUpdateUserInputFieldsSchema
    : updateUserSchema
  ).partial(),
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
