import { authenticatedProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { createId } from '@paralleldrive/cuid2'

export const generateVerificationToken = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/verficiationTokens',
      protect: true,
    },
  })
  .input(z.void())
  .output(
    z.object({
      verificationToken: z.string(),
    })
  )
  .mutation(async () => {
    const oneHourLater = new Date(Date.now() + 1000 * 60 * 60)
    const verificationToken = await prisma.verificationToken.create({
      data: {
        token: createId(),
        expires: oneHourLater,
        identifier: 'whatsapp webhook',
      },
    })

    return { verificationToken: verificationToken.token }
  })
