import { withSentry } from '@sentry/nextjs'
//import { DashboardFolder } from 'model'
//import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from 'services/api/utils'
import { methodNotAllowed, notAuthenticated } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser()
  if (!user) return notAuthenticated(res)

  //const id = req.query.id .toString()
  if (req.method === 'GET') {
    const folder = null
    //  await prisma.dashboardFolder.findFirst({
    //   where: {
    //     id,
    //     workspace: { members: { some: { userId: user.id } } },
    //   },
    // })
    return res.send({ folder })
  }
  if (req.method === 'DELETE') {
    const folders = null
    // const folders = await prisma.dashboardFolder.deleteMany({
    //   where: { id, workspace: { members: { some: { userId: user.id } } } },
    // })
    return res.send({ folders })
  }
  if (req.method === 'PATCH') {
    // const data = (
    //   typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    // ) as Partial<DashboardFolder>
    // const folders = await prisma.dashboardFolder.updateMany({
    //   where: {
    //     id,
    //     workspace: { members: { some: { userId: user.id } } },
    //   },
    //   data,
    // })
    const folders = null
    return res.send({ typebots: folders })
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)
