import { CustomDomain as CustomDomainInDb } from '@typebot.io/prisma'
import { z } from 'zod'

const domainNameRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/

export const customDomainSchema = z.object({
  name: z
    .string()
    .transform((name) => name.toLowerCase())
    .refine((name) => domainNameRegex.test(name)),
  workspaceId: z.string(),
  createdAt: z.date(),
}) satisfies z.ZodType<CustomDomainInDb>
