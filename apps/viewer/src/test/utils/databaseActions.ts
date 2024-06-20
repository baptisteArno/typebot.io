import { PrismaClient } from '@sniper.io/prisma'
import { SmtpCredentials } from '@sniper.io/schemas'
import { encrypt } from '@sniper.io/lib/api/encryption/encrypt'
import { proWorkspaceId } from '@sniper.io/playwright/databaseSetup'

const prisma = new PrismaClient()

export const createSmtpCredentials = async (
  id: string,
  smtpData: SmtpCredentials['data']
) => {
  const { encryptedData, iv } = await encrypt(smtpData)
  return prisma.credentials.create({
    data: {
      id,
      data: encryptedData,
      iv,
      name: smtpData.from.email as string,
      type: 'smtp',
      workspaceId: proWorkspaceId,
    },
  })
}
