import { withSentry } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { canReadTypebot, canWriteTypebot } from 'services/api/dbRules'
import { getAuthenticatedUser } from 'services/api/utils'
import { isFreePlan } from 'services/workspace'
import { forbidden, methodNotAllowed, notAuthenticated } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser()
  if (!user) return notAuthenticated(res)
  // const workspaceId = req.query.workspaceId as string | undefined
  // if (req.method === 'GET') {
  //   const workspace = await prisma.workspace.findFirst({
  //     where: { id: workspaceId, members: { some: { userId: user.id } } },
  //     select: { plan: true },
  //   })
  //   if (!workspace) return forbidden(res)
  //   const typebotId = req.query.typebotId.toString()
  //   const lastResultId = req.query.lastResultId?.toString()
  //   const take = parseInt(req.query.limit?.toString())
  //   const results = await prisma.result.findMany({
  //     take: isNaN(take) ? undefined : take,
  //     skip: lastResultId ? 1 : 0,
  //     cursor: lastResultId
  //       ? {
  //           id: lastResultId,
  //         }
  //       : undefined,
  //     where: {
  //       typebot: canReadTypebot(typebotId, user),
  //       answers: { some: {} },
  //       isCompleted: isFreePlan(workspace) ? true : undefined,
  //     },
  //     orderBy: {
  //       createdAt: 'desc',
  //     },
  //     include: { answers: true },
  //   })
  //   return res.status(200).send({ results })
  // }
  // if (req.method === 'DELETE') {
  //   const typebotId = req.query.typebotId.toString()
  //   const ids = req.query.ids as string[]
  //   const results = await prisma.result.deleteMany({
  //     where: {
  //       id: { in: ids },
  //       typebot: canWriteTypebot(typebotId, user),
  //     },
  //   })
  //   return res.status(200).send({ results })
  // }
  return methodNotAllowed(res)
}

export default withSentry(handler)
