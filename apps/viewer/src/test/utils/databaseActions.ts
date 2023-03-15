import { PrismaClient } from '@typebot.io/prisma'
import { SmtpCredentials } from '@typebot.io/schemas'
import { encrypt } from '@typebot.io/lib/api'
import { proWorkspaceId } from '@typebot.io/lib/playwright/databaseSetup'

const prisma = new PrismaClient()

export const createSmtpCredentials = (
  id: string,
  smtpData: SmtpCredentials['data']
) => {
  const { encryptedData, iv } = encrypt(smtpData)
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
