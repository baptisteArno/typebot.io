import { authenticatedProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import prisma from '@typebot.io/lib/prisma'

export const verifyIfPhoneNumberAvailable = authenticatedProcedure
  .input(z.object({ phoneNumberDisplayName: z.string() }))
  .query(async ({ input: { phoneNumberDisplayName } }) => {
    const existingWhatsAppCredentials = await prisma.credentials.findFirst({
      where: {
        type: 'whatsApp',
        name: phoneNumberDisplayName,
      },
    })

    if (existingWhatsAppCredentials) return { message: 'taken' }
    return { message: 'available' }
  })
