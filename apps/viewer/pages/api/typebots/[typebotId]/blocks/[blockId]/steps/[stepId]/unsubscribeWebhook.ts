import { withSentry } from '@sentry/nextjs'
import { Typebot, WebhookStep } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { authenticateUser } from 'services/api/utils'
import { byId, methodNotAllowed } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await authenticateUser(req)
  if (!user) return res.status(401).json({ message: 'Not authenticated' })
  if (req.method === 'POST') {
    const typebotId = req.query.typebotId as string
    const blockId = req.query.blockId as string
    const stepId = req.query.stepId as string
    // const typebot = (await prisma.typebot.findFirst({
    //   where: {
    //     id: typebotId,
    //     workspace: { members: { some: { userId: user.id } } },
    //   },
    // })) as unknown as Typebot | undefined
    // if (!typebot) 
    return res.status(400).send({ message: 'Typebot not found' })
    // try {
    //   const { webhookId } = typebot.blocks
    //     .find(byId(blockId))
    //     ?.steps.find(byId(stepId)) as WebhookStep
    //   await prisma.webhook.update({
    //     where: { id: webhookId },
    //     data: { url: null },
    //   })

    //   return res.send({ message: 'success' })
    // } catch (err) {
    //   return res
    //     .status(400)
    //     .send({ message: "stepId doesn't point to a Webhook step" })
    // }
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)
