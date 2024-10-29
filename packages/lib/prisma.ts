import { env } from '@typebot.io/env'
import { PrismaClient } from '@typebot.io/prisma'

declare const global: { prisma: PrismaClient }
let prisma: PrismaClient

console.log("Conteudo If Prisma:",env.NODE_ENV === 'production' && !process.versions.bun)
if (env.NODE_ENV === 'production' && !process.versions.bun) {
  prisma = new PrismaClient({
    log: ['info', 'warn', 'error'],
  })
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['info', 'warn', 'error'],
    })
  }
  prisma = global.prisma
}

export default prisma
