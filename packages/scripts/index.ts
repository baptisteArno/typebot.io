import { PrismaClient } from 'db'
import path from 'path'
import { injectFakeResults } from 'utils'

require('dotenv').config({
  path: path.join(
    __dirname,
    process.env.NODE_ENV === 'staging' ? '.env.staging' : '.env.local'
  ),
})

const prisma = new PrismaClient()

const main = async () => {
  await injectFakeResults(prisma)({
    count: 200,
    typebotId: 'cl8hl08xt009909l6pwqenf63',
    isChronological: false,
    fakeStorage: 3 * 1024 * 1024 * 1024,
  })
}

main().then()
