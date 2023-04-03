import { CustomDomain } from '@typebot.io/prisma'
import { got, HTTPError } from 'got'
import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import {
  badRequest,
  forbidden,
  methodNotAllowed,
  notAuthenticated,
} from '@typebot.io/lib/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)
  const workspaceId = req.query.workspaceId as string | undefined
  if (!workspaceId) return badRequest(res)
  if (req.method === 'GET') {
    const customDomains = await prisma.customDomain.findMany({
      where: {
        workspace: { id: workspaceId, members: { some: { userId: user.id } } },
      },
    })
    return res.send({ customDomains })
  }
  if (req.method === 'POST') {
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, members: { some: { userId: user.id } } },
      select: { id: true },
    })
    if (!workspace) return forbidden(res)
    const data = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as CustomDomain
    try {
      await createDomainOnVercel(data.name)
    } catch (err) {
      console.log(err)
      if (err instanceof HTTPError && err.response.statusCode !== 409)
        return res.status(err.response.statusCode).send(err.response.body)
    }

    const customDomains = await prisma.customDomain.create({
      data: {
        ...data,
        workspaceId,
      },
    })
    return res.send({ customDomains })
  }
  return methodNotAllowed(res)
}

const createDomainOnVercel = (name: string) =>
  got.post({
    url: `https://api.vercel.com/v8/projects/${process.env.NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME}/domains?teamId=${process.env.VERCEL_TEAM_ID}`,
    headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
    json: { name },
  })

export default handler
