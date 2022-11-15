import { CredentialsType, SmtpCredentialsData } from 'models'
import { PrismaClient } from 'db'
import { encrypt } from 'utils/api'
import { proWorkspaceId } from 'utils/playwright/databaseSetup'

const prisma = new PrismaClient()

export const createSmtpCredentials = (
  id: string,
  smtpData: SmtpCredentialsData
) => {
  const { encryptedData, iv } = encrypt(smtpData)
  return prisma.credentials.create({
    data: {
      id,
      data: encryptedData,
      iv,
      name: smtpData.from.email as string,
      type: CredentialsType.SMTP,
      workspaceId: proWorkspaceId,
    },
  })
}
