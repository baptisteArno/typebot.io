import { PrismaClient } from 'db'
import { promptAndSetEnvironment } from './utils'

const prisma = new PrismaClient()

export const cleanDatabase = async () => {
  await promptAndSetEnvironment('production')

  console.log('Starting database cleanup...')
  await deleteOldChatSessions()
  await deleteExpiredAppSessions()
  await deleteExpiredVerificationTokens()
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

const deleteExpiredAppSessions = async () => {
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  const { count } = await prisma.session.deleteMany({
    where: {
      expires: {
        lte: threeDaysAgo,
      },
    },
  })
  console.log(`Deleted ${count} expired user sessions.`)
}

const deleteExpiredVerificationTokens = async () => {
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  const { count } = await prisma.verificationToken.deleteMany({
    where: {
      expires: {
        lte: threeDaysAgo,
      },
    },
  })
  console.log(`Deleted ${count} expired verifiations tokens.`)
}

cleanDatabase().then()
