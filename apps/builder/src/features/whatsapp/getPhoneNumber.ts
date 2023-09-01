import { authenticatedProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import got from 'got'
import prisma from '@/lib/prisma'
import { decrypt } from '@typebot.io/lib/api'
import { TRPCError } from '@trpc/server'
import { WhatsAppCredentials } from '@typebot.io/schemas/features/whatsapp'
import { parsePhoneNumber } from 'libphonenumber-js'

const inputSchema = z.object({
  credentialsId: z.string().optional(),
  systemToken: z.string().optional(),
  phoneNumberId: z.string().optional(),
})

export const getPhoneNumber = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/whatsapp/phoneNumber',
      protect: true,
    },
  })
  .input(inputSchema)
  .output(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  )
  .query(async ({ input, ctx: { user } }) => {
    const credentials = await getCredentials(user.id, input)
    if (!credentials)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Credentials not found',
      })
    const { display_phone_number } = (await got(
      `https://graph.facebook.com/v17.0/${credentials.phoneNumberId}`,
      {
        headers: {
          Authorization: `Bearer ${credentials.systemUserAccessToken}`,
        },
      }
    ).json()) as {
      display_phone_number: string
    }

    const parsedPhoneNumber = parsePhoneNumber(display_phone_number)

    if (!parsedPhoneNumber.isValid())
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message:
          "Phone number is not valid. Make sure you don't provide a WhatsApp test number.",
      })

    return {
      id: credentials.phoneNumberId,
      name: parsedPhoneNumber.formatInternational().replace(/\s/g, ''),
    }
  })

const getCredentials = async (
  userId: string,
  input: z.infer<typeof inputSchema>
): Promise<WhatsAppCredentials['data'] | undefined> => {
  if (input.systemToken && input.phoneNumberId)
    return {
      systemUserAccessToken: input.systemToken,
      phoneNumberId: input.phoneNumberId,
    }
  if (!input.credentialsId) return
  const credentials = await prisma.credentials.findUnique({
    where: {
      id: input.credentialsId,
      workspace: { members: { some: { userId } } },
    },
  })
  if (!credentials) return
  return (await decrypt(
    credentials.data,
    credentials.iv
  )) as WhatsAppCredentials['data']
}
