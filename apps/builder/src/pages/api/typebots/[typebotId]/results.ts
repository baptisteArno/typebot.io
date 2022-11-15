import { withSentry } from '@sentry/nextjs'
import prisma from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { canReadTypebot, canWriteTypebot } from '@/utils/api/dbRules'
import {
  badRequest,
  forbidden,
  methodNotAllowed,
  notAuthenticated,
} from 'utils/api'
import { getAuthenticatedUser } from '@/features/auth'
import { archiveResults } from '@/features/results/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  const workspaceId = req.query.workspaceId as string | undefined
  if (!workspaceId) return badRequest(res, 'workspaceId is required')
  const workspace = await prisma.workspace.findFirst({
    where:
      user.email === process.env.ADMIN_EMAIL
        ? undefined
        : { id: workspaceId, members: { some: { userId: user.id } } },
    select: { plan: true },
  })
  if (!workspace) return forbidden(res)
  if (req.method === 'GET') {
    const typebotId = req.query.typebotId as string
    const lastResultId = req.query.lastResultId?.toString()
    const take = Number(req.query.limit?.toString())
    const results = await prisma.result.findMany({
      take: isNaN(take) ? undefined : take,
      skip: lastResultId ? 1 : 0,
      cursor: lastResultId
        ? {
            id: lastResultId,
          }
        : undefined,
      where: {
        typebot: canReadTypebot(typebotId, user),
        answers: { some: {} },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: { answers: true },
    })
    return res.status(200).send({ results })
  }
  if (req.method === 'DELETE') {
    const typebotId = req.query.typebotId as string
    const data = req.body as { ids: string[] }
    const ids = data.ids
    await archiveResults(res)({
      typebotId,
      user,
      resultsFilter: {
        id: ids.length > 0 ? { in: ids } : undefined,
        typebot: canWriteTypebot(typebotId, user),
      },
    })
    return res.status(200).send({ message: 'done' })
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)
