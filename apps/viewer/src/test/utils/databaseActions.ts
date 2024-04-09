import { PrismaClient } from '@typebot.io/prisma'
import { SmtpCredentials } from '@typebot.io/schemas'
import { encrypt } from '@typebot.io/lib/api/encryption/encrypt'
import { proWorkspaceId } from '@typebot.io/playwright/databaseSetup'

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
