import { Plan, PrismaClient, WorkspaceRole } from 'db'
import path from 'path'

const prisma = new PrismaClient()

export const migrateWorkspace = async () => {
  const users = await prisma.user.findMany({
    where: { workspaces: { none: {} } },
    include: {
      folders: true,
      typebots: true,
      credentials: true,
      customDomains: true,
      CollaboratorsOnTypebots: {
        include: { typebot: { select: { workspaceId: true } } },
      },
    },
    orderBy: { lastActivityAt: 'desc' },
  })
  let i = 1
  for (const user of users) {
    console.log('Updating', user.email, `(${i}/${users.length})`)
    i += 1
    const newWorkspace = await prisma.workspace.create({
      data: {
        name: user.name ? `${user.name}'s workspace` : 'My workspace',
        members: { create: { userId: user.id, role: WorkspaceRole.ADMIN } },
        stripeId: user.stripeId,
        plan: user.plan ?? Plan.FREE,
      },
    })
    await prisma.credentials.updateMany({
      where: { id: { in: user.credentials.map((c) => c.id) } },
      data: { workspaceId: newWorkspace.id, ownerId: null },
    })
    await prisma.customDomain.updateMany({
      where: {
        name: { in: user.customDomains.map((c) => c.name) },
        ownerId: user.id,
      },
      data: { workspaceId: newWorkspace.id, ownerId: null },
    })
    await prisma.dashboardFolder.updateMany({
      where: {
        id: { in: user.folders.map((c) => c.id) },
      },
      data: { workspaceId: newWorkspace.id, ownerId: null },
    })
    await prisma.typebot.updateMany({
      where: {
        id: { in: user.typebots.map((c) => c.id) },
      },
      data: { workspaceId: newWorkspace.id, ownerId: null },
    })
    for (const collab of user.CollaboratorsOnTypebots) {
      if (!collab.typebot.workspaceId) continue
      await prisma.memberInWorkspace.upsert({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId: collab.typebot.workspaceId,
          },
        },
        create: {
          role: WorkspaceRole.GUEST,
          userId: user.id,
          workspaceId: collab.typebot.workspaceId,
        },
        update: {},
      })
    }
  }
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
