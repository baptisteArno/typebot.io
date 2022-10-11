import { withSentry } from '@sentry/nextjs'
import { Typebot, WebhookStep } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { authenticateUser } from 'services/api/utils'
import { byId, methodNotAllowed } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await authenticateUser(req)
  if (!user) return res.status(401).json({ message: 'Not authenticated' })
  if (req.method === 'POST') {
    const body = req.body as Record<string, string>
    if (!('url' in body))
      return res.status(403).send({ message: 'url is missing in body' })
    const { url } = body
    const typebotId = req.query.typebotId as string
    const stepId = req.query.blockId as string
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
    //     .flatMap((b) => b.steps)
    //     .find(byId(stepId)) as WebhookStep
    //   await prisma.webhook.upsert({
    //     where: { id: webhookId },
    //     update: { url, body: '{{state}}', method: 'POST' },
    //     create: { url, body: '{{state}}', method: 'POST', typebotId },
    //   })

    //   return res.send({ message: 'success' })
    // } catch (err) {
    //   return res
    //     .status(400)
    //     .send({ message: "blockId doesn't point to a Webhook step" })
    // }
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)
