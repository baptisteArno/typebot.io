import prisma from '@typebot.io/lib/prisma'
import { Credentials } from '@typebot.io/schemas'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import {
  badRequest,
  forbidden,
  methodNotAllowed,
  notAuthenticated,
} from '@typebot.io/lib/api'
import { encrypt } from '@typebot.io/lib/api/encryption/encrypt'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)
  const workspaceId = req.query.workspaceId as string | undefined
  if (!workspaceId) return badRequest(res)
  if (req.method === 'GET') {
    const credentials = await prisma.credentials.findMany({
      where: {
        workspace: { id: workspaceId, members: { some: { userId: user.id } } },
      },
      select: { name: true, type: true, workspaceId: true, id: true },
    })
    return res.send({ credentials })
  }
  if (req.method === 'POST') {
    const data = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as Credentials
    const { encryptedData, iv } = await encrypt(data.data)
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, members: { some: { userId: user.id } } },
      select: { id: true },
    })
    if (!workspace) return forbidden(res)
    const credentials = await prisma.credentials.create({
      data: {
        ...data,
        data: encryptedData,
        iv,
        workspaceId,
      },
    })
    return res.send({ credentials })
  }
  return methodNotAllowed(res)
}

export default handler
