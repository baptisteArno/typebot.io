import { withSentry } from '@sentry/nextjs'
import prisma from 'libs/prisma'
import { InputBlockType, PublicTypebot } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { canPublishFileInput } from 'services/api/dbRules'
import { getAuthenticatedUser } from 'services/api/utils'
import { badRequest, methodNotAllowed, notAuthenticated } from 'utils/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  try {
    if (req.method === 'POST') {
      const workspaceId = req.query.workspaceId as string | undefined
      if (!workspaceId) return badRequest(res, 'workspaceId is required')
      const data = (
        typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      ) as PublicTypebot
      const typebotContainsFileInput = data.groups
        .flatMap((g) => g.blocks)
        .some((b) => b.type === InputBlockType.FILE)
      if (
        typebotContainsFileInput &&
        !(await canPublishFileInput({ userId: user.id, workspaceId, res }))
      )
        return
      const typebot = await prisma.publicTypebot.create({
        data: { ...data },
      })
      return res.send(typebot)
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

export default withSentry(handler)
