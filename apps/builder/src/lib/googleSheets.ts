import { Credentials as CredentialsFromDb } from '@typebot.io/prisma'
import { OAuth2Client, Credentials } from 'google-auth-library'
import { GoogleSheetsCredentials } from '@typebot.io/schemas'
import { isDefined } from '@typebot.io/lib'
import { decrypt, encrypt } from '@typebot.io/lib/api'
import prisma from './prisma'

export const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/credentials/google-sheets/callback`
)

export const getAuthenticatedGoogleClient = async (
  userId: string,
  credentialsId: string
): Promise<
  { client: OAuth2Client; credentials: CredentialsFromDb } | undefined
> => {
  const credentials = (await prisma.credentials.findFirst({
    where: { id: credentialsId, workspace: { members: { some: { userId } } } },
  })) as CredentialsFromDb | undefined
  if (!credentials) return
  const data = decrypt(
    credentials.data,
    credentials.iv
  ) as GoogleSheetsCredentials['data']

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
    const { encryptedData, iv } = encrypt(newCredentials)
    await prisma.credentials.update({
      where: { id: credentialsId },
      data: { data: encryptedData, iv },
    })
  }
