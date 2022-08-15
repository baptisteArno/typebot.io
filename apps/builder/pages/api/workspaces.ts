import { withSentry } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from 'services/api/utils'
import { methodNotAllowed, notAuthenticated } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser()
  if (!user) return notAuthenticated(res)
  if (req.method === 'GET') {
    const workspaces = [getMockWorkspace()]
    // const workspaces = await prisma.workspace.findMany({
    //   where: { members: { some: { userId: user.id } } },
    //   include: { members: true },
    //   orderBy: { createdAt: 'asc' },
    // })
    // console.log('workspaces', workspaces)
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

const getMockWorkspace = (): any => {
  return {
    id: "cl58nn2yr00087yvtmuef9o17",
    name: "Octadesk's workspace",
    icon: null,
    createdAt: new Date(),
    plan: "FREE",
    stripeId: null,
    members: [
      {
        userId: "cl58nn2y800007yvte9lq7dh4",
        workspaceId: "cl58nn2yr00087yvtmuef9o17",
        role: "ADMIN"
      }
    ]
  }
}

export default withSentry(handler)
