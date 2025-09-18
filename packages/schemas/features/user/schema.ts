import { GraphNavigation, User as PrismaUser } from '@typebot.io/prisma'
import { z } from '../../zod'

const displayedInAppNotificationsSchema = z.record(z.boolean())

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
  isAdmin: z.boolean().optional(),
}) satisfies z.ZodType<PrismaUser & { isAdmin?: boolean }>

export type User = z.infer<typeof userSchema>
