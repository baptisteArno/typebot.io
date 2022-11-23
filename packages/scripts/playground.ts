import { PrismaClient } from 'db'
import { promptAndSetEnvironment } from './utils'

const executePlayground = async () => {
  await promptAndSetEnvironment()
  const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] })
}

executePlayground()
