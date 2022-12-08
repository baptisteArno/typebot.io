import { withSentry } from '@sentry/nextjs'
import prisma from '@/lib/prisma'
import { InputBlockType, PublicTypebot } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { canPublishFileInput, canWriteTypebots } from '@/utils/api/dbRules'
import { getAuthenticatedUser } from '@/features/auth/api'
import { badRequest, methodNotAllowed, notAuthenticated } from 'utils/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
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
    const typebots = await prisma.publicTypebot.update({
      where: { id },
      data,
    })
    return res.send({ typebots })
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

export default withSentry(handler)
