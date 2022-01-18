import { Prisma, Credentials as CredentialsFromDb } from 'db'
import { OAuth2Client, Credentials } from 'google-auth-library'
import prisma from './prisma'

export const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/credentials/google-sheets/callback`
)

export const getAuthenticatedGoogleClient = async (
  credentialsId: string
): Promise<OAuth2Client> => {
  const credentials = (await prisma.credentials.findFirst({
    where: { id: credentialsId },
  })) as CredentialsFromDb
  oauth2Client.setCredentials(credentials.data as Credentials)
  oauth2Client.on('tokens', updateTokens(credentialsId))
  return oauth2Client
}

const updateTokens =
  (credentialsId: string) => async (credentials: Credentials) =>
    prisma.credentials.update({
      where: { id: credentialsId },
      data: { data: credentials as Prisma.InputJsonValue },
    })
