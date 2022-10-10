import { PrismaClient } from 'db'
import path from 'path'

require('dotenv').config({
  path: path.join(
    __dirname,
    process.env.NODE_ENV === 'staging' ? '.env.staging' : '.env.local'
  ),
})

const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] })

const main = async () => {
  const workspaces = await prisma.workspace.findMany({
    where: {
      members: { some: { userId: 'coucou' } },
    },
  })

  console.log(workspaces)
}

main().then()
