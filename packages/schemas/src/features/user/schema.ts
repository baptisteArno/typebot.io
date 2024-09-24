import { GraphNavigation } from "@typebot.io/prisma/enum";
import type { Prisma } from "@typebot.io/prisma/types";
import { z } from "@typebot.io/zod";

const displayedInAppNotificationsSchema = z.record(z.boolean());

export const userSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastActivityAt: z.date(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  emailVerified: z.date().nullable(),
  image: z.string().nullable(),
  company: z.string().nullable(),
  onboardingCategories: z.array(z.string()),
  referral: z.string().nullable(),
  graphNavigation: z.nativeEnum(GraphNavigation),
  preferredAppAppearance: z.string().nullable(),
  displayedInAppNotifications: displayedInAppNotificationsSchema.nullable(),
}) satisfies z.ZodType<Prisma.User>;

export type User = z.infer<typeof userSchema>;
