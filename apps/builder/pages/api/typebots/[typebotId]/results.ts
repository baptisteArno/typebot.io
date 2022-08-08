import { withSentry } from '@sentry/nextjs'
import prisma from 'libs/prisma'
import { InputBlockType, Typebot } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { canReadTypebot, canWriteTypebot } from 'services/api/dbRules'
import { deleteFiles } from 'services/api/storage'
import { getAuthenticatedUser } from 'services/api/utils'
import {
  badRequest,
  forbidden,
  methodNotAllowed,
  notAuthenticated,
} from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  const workspaceId = req.query.workspaceId as string | undefined
  if (!workspaceId) return badRequest(res, 'workspaceId is required')
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, members: { some: { userId: user.id } } },
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
    const resultsFilter = {
      id: ids.length > 0 ? { in: ids } : undefined,
      typebot: canWriteTypebot(typebotId, user),
    }
    const typebot = await prisma.typebot.findFirst({
      where: canWriteTypebot(typebotId, user),
      select: { groups: true },
    })
    if (!typebot) return forbidden(res)
    const fileUploadBlockIds = (typebot as Typebot).groups
      .flatMap((g) => g.blocks)
      .filter((b) => b.type === InputBlockType.FILE)
      .map((b) => b.id)
    if (fileUploadBlockIds.length > 0) {
      const filesToDelete = await prisma.answer.findMany({
        where: { result: resultsFilter, blockId: { in: fileUploadBlockIds } },
      })
      if (filesToDelete.length > 0)
        await deleteFiles({
          urls: filesToDelete.flatMap((a) => a.content.split(', ')),
        })
    }
    await prisma.log.deleteMany({
      where: {
        result: resultsFilter,
      },
    })
    await prisma.answer.deleteMany({
      where: {
        result: resultsFilter,
      },
    })
    await prisma.result.updateMany({
      where: resultsFilter,
      data: {
        isArchived: true,
        variables: [],
      },
    })
    return res.status(200).send({ message: 'done' })
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)
