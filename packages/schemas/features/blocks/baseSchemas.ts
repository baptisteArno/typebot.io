import { z } from 'zod'
import { Credentials as CredentialsFromPrisma } from '@typebot.io/prisma'

export const blockBaseSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  outgoingEdgeId: z.string().optional(),
})

export const optionBaseSchema = z.object({
  variableId: z.string().optional(),
})

export const credentialsBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  workspaceId: z.string(),
  name: z.string(),
  iv: z.string(),
}) satisfies z.ZodType<Omit<CredentialsFromPrisma, 'data' | 'type'>>
