import { CollaborationType, CollaboratorsOnSnipers } from '@sniper.io/prisma'
import { z } from '../zod'

export const collaboratorSchema = z.object({
  type: z.nativeEnum(CollaborationType),
  userId: z.string(),
  sniperId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies z.ZodType<CollaboratorsOnSnipers>
