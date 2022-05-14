import { withSentry } from '@sentry/nextjs'
import prisma from 'libs/prisma'
import { Block } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { authenticateUser } from 'services/api/utils'
import { byId, isNotDefined, isWebhookStep, methodNotAllowed } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const user = await authenticateUser(req)
    if (!user) return res.status(401).json({ message: 'Not authenticated' })
    const typebotId = req.query.typebotId.toString()
    const typebot = await prisma.typebot.findFirst({
      where: {
        id: typebotId,
        workspace: { members: { some: { userId: user.id } } },
      },
      select: { blocks: true, webhooks: true },
    })
    const emptyWebhookSteps = (typebot?.blocks as Block[]).reduce<
      { blockId: string; id: string; name: string }[]
    >((emptyWebhookSteps, block) => {
      const steps = block.steps.filter(
        (step) =>
          isWebhookStep(step) &&
          isNotDefined(typebot?.webhooks.find(byId(step.webhookId))?.url)
      )
      return [
        ...emptyWebhookSteps,
        ...steps.map((s) => ({
          id: s.id,
          blockId: s.blockId,
          name: `${block.title} > ${s.id}`,
        })),
      ]
    }, [])
    return res.send({ steps: emptyWebhookSteps })
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)
