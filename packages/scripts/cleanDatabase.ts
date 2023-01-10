import { PrismaClient } from 'db'
import { promptAndSetEnvironment } from './utils'

const prisma = new PrismaClient()

export const cleanDatabase = async () => {
  await promptAndSetEnvironment('production')

  console.log('Starting database cleanup...')
  await deleteOldChatSessions()
  console.log('Done!')
}

const deleteOldChatSessions = async () => {
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  const { count } = await prisma.chatSession.deleteMany({
    where: {
      updatedAt: {
        lte: threeDaysAgo,
      },
    },
  })
  console.log(`Deleted ${count} old chat sessions.`)
}

cleanDatabase().then()
