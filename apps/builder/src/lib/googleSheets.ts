import { Credentials as CredentialsFromDb } from '@typebot.io/prisma'
import { OAuth2Client, Credentials } from 'google-auth-library'
import { GoogleSheetsCredentials } from '@typebot.io/schemas'
import { isDefined } from '@typebot.io/lib'
import { env } from '@typebot.io/env'
import prisma from '@typebot.io/lib/prisma'
import { decrypt } from '@typebot.io/lib/api/encryption/decrypt'
import { encrypt } from '@typebot.io/lib/api/encryption/encrypt'

export const getAuthenticatedGoogleClient = async (
  userId: string,
  credentialsId: string
): Promise<
  { client: OAuth2Client; credentials: CredentialsFromDb } | undefined
> => {
  const oauth2Client = new OAuth2Client(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${env.NEXTAUTH_URL}/api/credentials/google-sheets/callback`
  )
  const credentials = (await prisma.credentials.findFirst({
    where: { id: credentialsId, workspace: { members: { some: { userId } } } },
  })) as CredentialsFromDb | undefined
  if (!credentials) return
  const data = (await decrypt(
    credentials.data,
    credentials.iv
  )) as GoogleSheetsCredentials['data']

  oauth2Client.setCredentials(data)
  oauth2Client.on('tokens', updateTokens(credentials.id, data))
  return { client: oauth2Client, credentials }
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
