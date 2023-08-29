import { authenticatedProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import prisma from '@/lib/prisma'

export const verifyIfPhoneNumberAvailable = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/whatsapp/phoneNumber/{phoneNumberDisplayName}/available',
      protect: true,
    },
  })
  .input(z.object({ phoneNumberDisplayName: z.string() }))
  .output(
    z.object({
      message: z.enum(['available', 'taken']),
    })
  )
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
