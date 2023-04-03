import prisma from '@/lib/prisma'
import { InputBlockType, PublicTypebot } from '@typebot.io/schemas'
import { NextApiRequest, NextApiResponse } from 'next'
import { canPublishFileInput, canWriteTypebots } from '@/helpers/databaseRules'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import {
  badRequest,
  methodNotAllowed,
  notAuthenticated,
} from '@typebot.io/lib/api'
import { sendTelemetryEvents } from '@typebot.io/lib/telemetry/sendTelemetryEvent'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)

  const id = req.query.id as string
  const workspaceId = req.query.workspaceId as string | undefined

  if (req.method === 'PUT') {
    const data = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as PublicTypebot
    if (!workspaceId) return badRequest(res, 'workspaceId is required')
    const typebotContainsFileInput = data.groups
      .flatMap((g) => g.blocks)
      .some((b) => b.type === InputBlockType.FILE)
    if (
      typebotContainsFileInput &&
      !(await canPublishFileInput({ userId: user.id, workspaceId, res }))
    )
      return
    const publicTypebot = await prisma.publicTypebot.update({
      where: { id },
      data,
      include: {
        typebot: { select: { name: true } },
      },
    })
    await sendTelemetryEvents([
      {
        name: 'Typebot published',
        userId: user.id,
        workspaceId,
        typebotId: publicTypebot.typebotId,
        data: {
          name: publicTypebot.typebot.name,
        },
      },
    ])
    return res.send({ typebot: publicTypebot })
  }
  if (req.method === 'DELETE') {
    const publishedTypebotId = req.query.id as string
    const typebotId = req.query.typebotId as string | undefined
    if (!typebotId) return badRequest(res, 'typebotId is required')
    await prisma.publicTypebot.deleteMany({
      where: {
        id: publishedTypebotId,
        typebot: canWriteTypebots(typebotId, user),
      },
    })
    return res.send({ success: true })
  }
  return methodNotAllowed(res)
}

export default handler
