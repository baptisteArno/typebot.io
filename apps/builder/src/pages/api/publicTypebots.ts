import prisma from '@/lib/prisma'
import { InputBlockType, PublicTypebot } from '@typebot.io/schemas'
import { NextApiRequest, NextApiResponse } from 'next'
import { canPublishFileInput } from '@/helpers/databaseRules'
import {
  badRequest,
  methodNotAllowed,
  notAuthenticated,
} from '@typebot.io/lib/api'
import { getAuthenticatedUser } from '@/features/auth/helpers/getAuthenticatedUser'
import { sendTelemetryEvents } from '@typebot.io/lib/telemetry/sendTelemetryEvent'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res)
  if (!user) return notAuthenticated(res)
  try {
    if (req.method === 'POST') {
      const workspaceId = req.query.workspaceId as string | undefined
      if (!workspaceId) return badRequest(res, 'workspaceId is required')
      const data = (
        typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      ) as Omit<PublicTypebot, 'id'>
      const typebotContainsFileInput = data.groups
        .flatMap((g) => g.blocks)
        .some((b) => b.type === InputBlockType.FILE)
      if (
        typebotContainsFileInput &&
        !(await canPublishFileInput({ userId: user.id, workspaceId, res }))
      )
        return
      const publicTypebot = await prisma.publicTypebot.create({
        data: { ...data },
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
            isFirstPublish: true,
            name: publicTypebot.typebot.name,
          },
        },
      ])
      return res.send(publicTypebot)
    }
    return methodNotAllowed(res)
  } catch (err) {
    console.error(err)
    if (err instanceof Error) {
      return res.status(500).send({ title: err.name, message: err.message })
    }
    return res.status(500).send({ message: 'An error occured', error: err })
  }
}

export default handler
