import { env } from '@typebot.io/env'
import { PrismaClient } from '@typebot.io/prisma'

declare const global: { prisma: PrismaClient }
let prisma: PrismaClient

if (env.NODE_ENV === 'production' && !process.versions.bun) {
  prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    })
  }
  prisma = global.prisma
}

prisma.$use(async (params, next) => {
  const before = Date.now()
  const result = await next(params)
  const after = Date.now()

  console.log(`Query took ${after - before}ms`)
  console.log(`Params: ${JSON.stringify(params, null, 2)}`)
  return result
})

export default prisma
