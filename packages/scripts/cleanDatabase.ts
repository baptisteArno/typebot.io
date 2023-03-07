import { PrismaClient } from 'db'
import { promptAndSetEnvironment } from './utils'

const prisma = new PrismaClient()

export const cleanDatabase = async () => {
  await promptAndSetEnvironment('production')

  console.log('Starting database cleanup...')
  await deleteOldChatSessions()
  await deleteExpiredAppSessions()
  await deleteExpiredVerificationTokens()
  const isFirstOfMonth = new Date().getDate() === 1
  if (isFirstOfMonth) {
    await deleteArchivedTypebots()
    await deleteArchivedResults()
  }
  console.log('Done!')
}

const deleteArchivedTypebots = async () => {
  const lastDayOfPreviousMonth = new Date()
  lastDayOfPreviousMonth.setMonth(lastDayOfPreviousMonth.getMonth() - 1)
  lastDayOfPreviousMonth.setDate(0)

  const { count } = await prisma.typebot.deleteMany({
    where: {
      updatedAt: {
        lte: lastDayOfPreviousMonth,
      },
      isArchived: true,
    },
  })

  console.log(`Deleted ${count} archived typebots.`)
}

const deleteArchivedResults = async () => {
  const lastDayOfPreviousMonth = new Date()
  lastDayOfPreviousMonth.setMonth(lastDayOfPreviousMonth.getMonth() - 1)
  lastDayOfPreviousMonth.setDate(0)

  const { count } = await prisma.result.deleteMany({
    where: {
      createdAt: {
        lte: lastDayOfPreviousMonth,
      },
      isArchived: true,
    },
  })

  console.log(`Deleted ${count} archived results.`)
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
