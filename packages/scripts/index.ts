import { PrismaClient } from 'db'
import path from 'path'

require('dotenv').config({
  path: path.join(
    __dirname,
    process.env.NODE_ENV === 'staging' ? '.env.staging' : '.env.local'
  ),
})

const prisma = new PrismaClient()

const main = async () => {}

main().then()
