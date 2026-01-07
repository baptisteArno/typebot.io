import { GraphNavigation } from "@typebot.io/prisma/enum";
import type { Prisma } from "@typebot.io/prisma/types";
import { z } from "@typebot.io/zod";

const displayedInAppNotificationsSchema = z.record(z.boolean());

export const groupTitlesAutoGenerationSchema = z.object({
  isEnabled: z.boolean().optional(),
  provider: z.string().optional(),
  credentialsId: z.string().optional(),
  model: z.string().optional(),
  prompt: z.string().optional(),
});
export type GroupTitlesAutoGeneration = z.infer<
  typeof groupTitlesAutoGenerationSchema
>;

export const userSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  // Better Auth required fields
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  // Better Auth plugin fields
  role: z.string(),
  banned: z.boolean(),
  banReason: z.string().nullable(),
  banExpires: z.date().nullable(),
  twoFactorEnabled: z.boolean(),
  phoneNumber: z.string().nullable(),
  phoneNumberVerified: z.boolean(),
  // Typebot-specific fields
  lastActivityAt: z.date(),
  company: z.string().nullable(),
  onboardingCategories: z.array(z.string()),
  referral: z.string().nullable(),
  graphNavigation: z.nativeEnum(GraphNavigation).nullable(),
  preferredAppAppearance: z.string().nullable(),
  displayedInAppNotifications: displayedInAppNotificationsSchema.nullable(),
  groupTitlesAutoGeneration: groupTitlesAutoGenerationSchema.nullable(),
  preferredLanguage: z.string().nullable(),
  termsAcceptedAt: z.date().nullable(),
}) satisfies z.ZodType<Prisma.User>;
export type User = z.infer<typeof userSchema>;

export const clientUserSchema = userSchema.pick({
  id: true,
  name: true,
  email: true,
  image: true,
  company: true,
  createdAt: true,
  lastActivityAt: true,
  graphNavigation: true,
  preferredAppAppearance: true,
  displayedInAppNotifications: true,
  groupTitlesAutoGeneration: true,
  preferredLanguage: true,
  termsAcceptedAt: true,
});
export type ClientUser = z.infer<typeof clientUserSchema>;

export const updateUserSchema = userSchema.pick({
  onboardingCategories: true,
  displayedInAppNotifications: true,
  groupTitlesAutoGeneration: true,
  name: true,
  image: true,
  company: true,
  graphNavigation: true,
  preferredAppAppearance: true,
  preferredLanguage: true,
  referral: true,
});
export type UpdateUser = z.infer<typeof updateUserSchema>;
