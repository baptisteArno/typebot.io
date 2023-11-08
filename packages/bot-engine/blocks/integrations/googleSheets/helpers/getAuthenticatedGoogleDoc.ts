import { TRPCError } from '@trpc/server'
import { env } from '@typebot.io/env'
import { encrypt } from '@typebot.io/lib/api/encryption/encrypt'
import { decrypt } from '@typebot.io/lib/api/encryption/decrypt'
import { isDefined } from '@typebot.io/lib/utils'
import { Credentials as CredentialsFromDb } from '@typebot.io/prisma'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { OAuth2Client, Credentials } from 'google-auth-library'
import prisma from '@typebot.io/lib/prisma'
import { GoogleSheetsCredentials } from '@typebot.io/schemas'

export const getAuthenticatedGoogleDoc = async ({
  credentialsId,
  spreadsheetId,
}: {
  credentialsId?: string
  spreadsheetId?: string
}) => {
  if (!credentialsId || !spreadsheetId)
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Missing credentialsId or spreadsheetId',
    })
  const auth = await getAuthenticatedGoogleClient(credentialsId)
  if (!auth)
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: "Couldn't find credentials in database",
    })
  return new GoogleSpreadsheet(spreadsheetId, auth)
}

const getAuthenticatedGoogleClient = async (
  credentialsId: string
): Promise<OAuth2Client | undefined> => {
  const credentials = (await prisma.credentials.findFirst({
    where: { id: credentialsId },
  })) as CredentialsFromDb | undefined
  if (!credentials) return
  const data = (await decrypt(
    credentials.data,
    credentials.iv
  )) as GoogleSheetsCredentials['data']

  const oauth2Client = new OAuth2Client(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${env.NEXTAUTH_URL}/api/credentials/google-sheets/callback`
  )
  oauth2Client.setCredentials(data)
  oauth2Client.on('tokens', updateTokens(credentialsId, data))
  return oauth2Client
}

const updateTokens =
  (
    credentialsId: string,
    existingCredentials: GoogleSheetsCredentials['data']
  ) =>
  async (credentials: Credentials) => {
    if (
      isDefined(existingCredentials.id_token) &&
      credentials.id_token !== existingCredentials.id_token
    )
      return
    const newCredentials: GoogleSheetsCredentials['data'] = {
      ...existingCredentials,
      expiry_date: credentials.expiry_date,
      access_token: credentials.access_token,
    }
    const { encryptedData, iv } = await encrypt(newCredentials)
    await prisma.credentials.updateMany({
      where: { id: credentialsId },
      data: { data: encryptedData, iv },
    })
  }
