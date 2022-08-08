import { PrismaClient } from 'db'
import path from 'path'
import fs from 'fs'

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

const main = async () => {}

main().then()
