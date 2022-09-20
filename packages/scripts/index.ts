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
    count: 150,
    typebotId: 'cl89sq4vb030109laivd9ck97',
    isChronological: false,
    idPrefix: 'batch2',
  })
}

main().then()
