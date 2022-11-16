import { PrismaClient } from 'db'
import path from 'path'
import { setCustomPlan } from './setCustomPlan'

require('dotenv').config({
  path: path.join(
    __dirname,
    process.env.NODE_ENV === 'production'
      ? '.env.production'
      : process.env.NODE_ENV === 'staging'
      ? '.env.staging'
      : '.env.local'
  ),
})

const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] })

const main = async () => {
  setCustomPlan()
}

main().then()
