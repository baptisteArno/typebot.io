import { Credentials as CredentialsFromDb } from 'db'
import { OAuth2Client } from 'google-auth-library'
import { GoogleSheetsCredentialsData } from 'models'
import { decrypt, encrypt } from 'utils'
import prisma from './prisma'

export const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/credentials/google-sheets/callback`
)

export const getAuthenticatedGoogleClient = async (
  userId: string,
  credentialsId: string
): Promise<OAuth2Client> => {
  const credentials = (await prisma.credentials.findFirst({
    where: { id: credentialsId, ownerId: userId },
  })) as CredentialsFromDb
  const data = decrypt(
    credentials.data,
    credentials.iv
  ) as GoogleSheetsCredentialsData
  oauth2Client.setCredentials(data)
  oauth2Client.on('tokens', updateTokens(credentialsId))
  return oauth2Client
}

const updateTokens =
  (credentialsId: string) =>
  async (credentials: GoogleSheetsCredentialsData) => {
    const { encryptedData, iv } = encrypt(credentials)
    return prisma.credentials.update({
      where: { id: credentialsId },
      data: { data: encryptedData, iv },
    })
  }
