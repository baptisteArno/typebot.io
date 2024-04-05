import { env } from '@typebot.io/env'
import { PrismaClient } from '@typebot.io/prisma'

declare const global: { prisma: PrismaClient }
let prisma: PrismaClient

if (env.NODE_ENV === 'production' && !process.versions.bun) {
  prisma = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'stdout',
        level: 'error',
      },
      {
        emit: 'stdout',
        level: 'info',
      },
      {
        emit: 'stdout',
        level: 'warn',
      },
    ],
  })
  //@ts-ignore
  prisma.$on('query', (e: { query: string; duration: string }) => {
    console.log('Query: ' + e.query)
    console.log('Duration: ' + e.duration + 'ms')
  })
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'stdout',
          level: 'error',
        },
        {
          emit: 'stdout',
          level: 'info',
        },
        {
          emit: 'stdout',
          level: 'warn',
        },
      ],
    })
  }
  prisma = global.prisma
  //@ts-ignore
  prisma.$on('query', (e: { query: string; duration: string }) => {
    console.log('Query: ' + e.query)
    console.log('Duration: ' + e.duration + 'ms')
  })
}

export default prisma
