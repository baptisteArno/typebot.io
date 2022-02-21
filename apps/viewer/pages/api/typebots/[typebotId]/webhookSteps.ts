import { withSentry } from '@sentry/nextjs'
import prisma from 'libs/prisma'
import { Block, IntegrationStepType } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { authenticateUser } from 'services/api/utils'
import { methodNotAllowed } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const user = await authenticateUser(req)
    if (!user) return res.status(401).json({ message: 'Not authenticated' })
    const typebotId = req.query.typebotId.toString()
    const typebot = await prisma.typebot.findUnique({
      where: { id_ownerId: { id: typebotId, ownerId: user.id } },
      select: { blocks: true },
    })
    const emptyWebhookSteps = (typebot?.blocks as Block[]).reduce<
      { blockId: string; stepId: string; name: string }[]
    >((emptyWebhookSteps, block) => {
      const steps = block.steps.filter(
        (step) => step.type === IntegrationStepType.WEBHOOK && !step.webhook.url
      )
      return [
        ...emptyWebhookSteps,
        ...steps.map((s) => ({
          blockId: s.blockId,
          stepId: s.id,
          name: `${block.title} > ${s.id}`,
        })),
      ]
    }, [])
    return res.send({ steps: emptyWebhookSteps })
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)
