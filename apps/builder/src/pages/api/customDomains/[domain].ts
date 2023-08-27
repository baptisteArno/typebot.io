import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import {
  badRequest,
  methodNotAllowed,
  notAuthenticated,
} from '@typebot.io/lib/api'
import { got } from 'got'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { env } from '@typebot.io/env'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)
  const workspaceId = req.query.workspaceId as string | undefined
  if (!workspaceId) return badRequest(res)
  if (req.method === 'DELETE') {
    const domain = req.query.domain as string
    try {
      await deleteDomainOnVercel(domain)
    } catch {
      /* empty */
    }
    const customDomains = await prisma.customDomain.delete({
      where: { name: domain },
    })

    return res.send({ customDomains })
  }
  return methodNotAllowed(res)
}

const deleteDomainOnVercel = (name: string) =>
  got.delete({
    url: `https://api.vercel.com/v8/projects/${env.NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME}/domains/${name}?teamId=${env.VERCEL_TEAM_ID}`,
    headers: { Authorization: `Bearer ${env.VERCEL_TOKEN}` },
  })

export default handler
