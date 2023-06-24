import { PrismaClient } from '@typebot.io/prisma'
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
    await deleteArchivedResults()
    await deleteArchivedTypebots()
    await resetQuarantinedWorkspaces()
  }
  console.log('Done!')
}

const deleteArchivedTypebots = async () => {
  const lastDayTwoMonthsAgo = new Date()
  lastDayTwoMonthsAgo.setMonth(lastDayTwoMonthsAgo.getMonth() - 1)
  lastDayTwoMonthsAgo.setDate(0)

  const { count } = await prisma.typebot.deleteMany({
    where: {
      updatedAt: {
        lte: lastDayTwoMonthsAgo,
      },
      isArchived: true,
    },
  })

  console.log(`Deleted ${count} archived typebots.`)
}

const deleteArchivedResults = async () => {
  const lastDayTwoMonthsAgo = new Date()
  lastDayTwoMonthsAgo.setMonth(lastDayTwoMonthsAgo.getMonth() - 1)
  lastDayTwoMonthsAgo.setDate(0)

  const results = await prisma.result.findMany({
    where: {
      createdAt: {
        lte: lastDayTwoMonthsAgo,
      },
      isArchived: true,
    },
    select: { id: true },
  })

  console.log(`Deleting ${results.length} archived results...`)
  const chunkSize = 1000
  for (let i = 0; i < results.length; i += chunkSize) {
    const chunk = results.slice(i, i + chunkSize)
    await prisma.result.deleteMany({
      where: {
        id: {
          in: chunk.map((result) => result.id),
        },
      },
    })
  }
}

const deleteOldChatSessions = async () => {
  const twoDaysAgo = new Date()
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
  let totalChatSessions
  do {
    const chatSessions = await prisma.chatSession.findMany({
      where: {
        updatedAt: {
          lte: twoDaysAgo,
        },
      },
      select: {
        id: true,
      },
      take: 80000,
    })

    totalChatSessions = chatSessions.length

    console.log(`Deleting ${chatSessions.length} old chat sessions...`)
    const chunkSize = 1000
    for (let i = 0; i < chatSessions.length; i += chunkSize) {
      const chunk = chatSessions.slice(i, i + chunkSize)
      await prisma.chatSession.deleteMany({
        where: {
          id: {
            in: chunk.map((chatSession) => chatSession.id),
          },
        },
      })
    }
  } while (totalChatSessions === 80000)
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
  let totalVerificationTokens
  do {
    const verificationTokens = await prisma.verificationToken.findMany({
      where: {
        expires: {
          lte: threeDaysAgo,
        },
      },
      select: {
        token: true,
      },
      take: 80000,
    })

    totalVerificationTokens = verificationTokens.length

    console.log(`Deleting ${verificationTokens.length} expired tokens...`)
    const chunkSize = 1000
    for (let i = 0; i < verificationTokens.length; i += chunkSize) {
      const chunk = verificationTokens.slice(i, i + chunkSize)
      await prisma.verificationToken.deleteMany({
        where: {
          token: {
            in: chunk.map((verificationToken) => verificationToken.token),
          },
        },
      })
    }
  } while (totalVerificationTokens === 80000)
}

const resetQuarantinedWorkspaces = async () =>
  prisma.workspace.updateMany({
    where: {
      isQuarantined: true,
    },
    data: {
      isQuarantined: false,
    },
  })

cleanDatabase().then()
