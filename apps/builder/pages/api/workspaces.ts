import { withSentry } from '@sentry/nextjs'
import { Workspace } from 'db'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from 'services/api/utils'
import { methodNotAllowed, notAuthenticated } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  if (req.method === 'GET') {
    const workspaces = await prisma.workspace.findMany({
      where: { members: { some: { userId: user.id } } },
      include: { members: true },
      orderBy: { createdAt: 'asc' },
    })
    console.log('workspaces', workspaces)
    return res.send({ workspaces })
  }
  // if (req.method === 'POST') {
  //   const data = req.body as Workspace
  //   const workspace = await prisma.workspace.create({
  //     data: {
  //       ...data,
  //       members: { create: [{ role: 'ADMIN', userId: user.id }] },
  //     },
  //   })
  //   return res.status(200).json({
  //     workspace,
  //   })
  // }
  methodNotAllowed(res)
}

export default withSentry(handler)
