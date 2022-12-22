import { PrismaClient } from 'db'
import { promptAndSetEnvironment } from './utils'
import { groupSchema } from 'models'
import { readFileSync, writeFileSync } from 'fs'
import { exit } from 'process'

const executePlayground = async () => {
  await promptAndSetEnvironment()
  const prisma = new PrismaClient({
    log: [{ emit: 'event', level: 'query' }, 'info', 'warn', 'error'],
  })

  prisma.$on('query', (e) => {
    console.log(e.query)
    console.log(e.params)
    console.log(e.duration, 'ms')
  })

  const typebots = JSON.parse(readFileSync('typebots.json', 'utf-8')) as any[]

  for (const typebot of typebots) {
    for (const group of typebot.groups) {
      const parser = groupSchema.safeParse(group)
      if ('error' in parser) {
        console.log(
          group.id,
          parser.error.issues.map((issue) =>
            JSON.stringify({
              message: issue.message,
              path: issue.path,
            })
          )
        )
        writeFileSync('failedTypebot.json', JSON.stringify(typebot))
        exit()
      }
    }
  }
}

executePlayground()
