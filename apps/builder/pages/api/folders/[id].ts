import { DashboardFolder } from '@typebot/prisma'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { methodNotAllowed } from 'services/api/utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })

  if (!session?.user)
    return res.status(401).json({ message: 'Not authenticated' })

  const id = req.query.id.toString()
  if (req.method === 'GET') {
    const folder = await prisma.dashboardFolder.findUnique({
      where: { id },
    })
    return res.send({ folder })
  }
  if (req.method === 'DELETE') {
    const folders = await prisma.dashboardFolder.delete({
      where: { id },
    })
    return res.send({ folders })
  }
  if (req.method === 'PATCH') {
    const data = JSON.parse(req.body) as Partial<DashboardFolder>
    const folders = await prisma.dashboardFolder.update({
      where: { id },
      data,
    })
    return res.send({ typebots: folders })
  }
  return methodNotAllowed(res)
}

export default handler
