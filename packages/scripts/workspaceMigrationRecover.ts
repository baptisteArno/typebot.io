// See https://github.com/baptisteArno/typebot.io/issues/37

import { Plan, PrismaClient, WorkspaceRole } from 'db'
import path from 'path'

const prisma = new PrismaClient()

export const migrateWorkspace = async () => {
  const user = await prisma.user.findFirst()
  if (!user) return
  console.log('Updating', user.email)
  const newWorkspace = await prisma.workspace.create({
    data: {
      name: user.name ? `${user.name}'s workspace` : 'My workspace',
      members: { create: { userId: user.id, role: WorkspaceRole.ADMIN } },
      plan: Plan.TEAM,
    },
  })
  await prisma.credentials.updateMany({
    data: { workspaceId: newWorkspace.id },
  })
  await prisma.customDomain.updateMany({
    data: { workspaceId: newWorkspace.id },
  })
  await prisma.dashboardFolder.updateMany({
    data: { workspaceId: newWorkspace.id },
  })
  await prisma.typebot.updateMany({
    data: { workspaceId: newWorkspace.id },
  })
}

require('dotenv').config({
  path: path.join(
    __dirname,
    process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local'
  ),
})

const main = async () => {
  await migrateWorkspace()
}

main().then()
