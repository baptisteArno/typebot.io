import { authenticatedProcedure } from '@/helpers/server/trpc'
import prisma from '@typebot.io/lib/prisma'
import { createId } from '@paralleldrive/cuid2'

export const generateVerificationToken = authenticatedProcedure.mutation(
  async () => {
    const oneHourLater = new Date(Date.now() + 1000 * 60 * 60)
    const verificationToken = await prisma.verificationToken.create({
      data: {
        token: createId(),
        expires: oneHourLater,
        identifier: 'whatsapp webhook',
      },
    })

    return { verificationToken: verificationToken.token }
  }
)
