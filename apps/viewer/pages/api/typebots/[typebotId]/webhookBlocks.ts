import { withSentry } from '@sentry/nextjs'
//import prisma from 'libs/prisma'
import { Block, WebhookStep } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { authenticateUser } from 'services/api/utils'
import { byId, isWebhookStep, methodNotAllowed } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const user = await authenticateUser(req)
    if (!user) return res.status(401).json({ message: 'Not authenticated' })
    const typebotId = req.query.typebotId as string
    // const typebot = await prisma.typebot.findFirst({
    //   where: {
    //     id: typebotId,
    //     workspace: { members: { some: { userId: user.id } } },
    //   },
    //   select: { blocks: true, webhooks: true },
    // })
    // const emptyWebhookSteps = (typebot?.blocks as Block[]).reduce<
    //   { blockId: string; name: string; url: string | undefined }[]
    // >((emptyWebhookSteps, block) => {
    //   const steps = block.steps.filter((step) =>
    //     isWebhookStep(step)
    //   ) as WebhookStep[]
    //   return [
    //     ...emptyWebhookSteps,
    //     ...steps.map((s) => ({
    //       blockId: s.id,
    //       name: `${block.title} > ${s.id}`,
    //       url: typebot?.webhooks.find(byId(s.webhookId))?.url ?? undefined,
    //     })),
    //   ]
    //}, [])
    return res.send({ blocks: [] })
    //return res.send({ blocks: emptyWebhookSteps })
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)
