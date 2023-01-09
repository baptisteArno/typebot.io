import { PrismaClient } from 'db'
import { Typebot } from 'models'
import { parseCreateTypebot } from 'utils/playwright/databaseActions'
import { join } from 'path'
import { parseTypebotToPublicTypebot } from 'utils/playwright/databaseHelpers'
import { readFileSync } from 'fs'

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({
  override: true,
  path: join(__dirname, `.env.local`),
})

const seedDatabase = async () => {
  const prisma = new PrismaClient()
  const data = JSON.parse(
    readFileSync(join(__dirname, 'ladleTypebot.json')).toString()
  ) as Typebot

  const ladleWorkspace = {
    id: 'ladleWorkspace',
    name: 'Ladle',
  }
  await prisma.workspace.upsert({
    where: { id: ladleWorkspace.id },
    update: {},
    create: ladleWorkspace,
  })
  const ladleTypebot = parseCreateTypebot({
    ...data,
    id: 'ladleTypebot',
    folderId: undefined,
    workspaceId: ladleWorkspace.id,
    theme: {
      ...data.theme,
      chat: {
        ...data.theme.chat,
        hostAvatar: {
          isEnabled: true,
        },
      },
    },
  }) as Typebot
  const ladlePublicTypebot = parseTypebotToPublicTypebot(
    ladleTypebot.id + 'Public',
    ladleTypebot
  )
  await prisma.typebot.upsert({
    where: { id: ladleTypebot.id },
    update: ladleTypebot,
    create: ladleTypebot,
  })
  await prisma.publicTypebot.upsert({
    where: { id: ladlePublicTypebot.id },
    update: ladlePublicTypebot,
    create: ladlePublicTypebot,
  })
}

seedDatabase().then()
