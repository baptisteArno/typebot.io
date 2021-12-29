import { DashboardFolder, User } from 'db'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { methodNotAllowed } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })

  if (!session?.user)
    return res.status(401).json({ message: 'Not authenticated' })

  const user = session.user as User
  const parentFolderId = req.query.parentId
    ? req.query.parentId.toString()
    : null
  if (req.method === 'GET') {
    const folders = await prisma.dashboardFolder.findMany({
      where: {
        ownerId: user.id,
        parentFolderId,
      },
    })
    return res.send({ folders })
  }
  if (req.method === 'POST') {
    const data = JSON.parse(req.body) as Pick<DashboardFolder, 'parentFolderId'>
    const folder = await prisma.dashboardFolder.create({
      data: { ...data, ownerId: user.id, name: 'New folder' },
    })
    return res.send(folder)
  }
  return methodNotAllowed(res)
}

export default handler
