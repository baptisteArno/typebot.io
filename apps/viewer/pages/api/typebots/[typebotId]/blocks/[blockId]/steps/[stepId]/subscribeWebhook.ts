import { withSentry } from '@sentry/nextjs'
import { Prisma } from 'db'
import prisma from 'libs/prisma'
import { HttpMethod, IntegrationStepType, Typebot } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { authenticateUser } from 'services/api/utils'
import { methodNotAllowed } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'PATCH') {
    const user = await authenticateUser(req)
    if (!user) return res.status(401).json({ message: 'Not authenticated' })
    const body = req.body as Record<string, string>
    if (!('url' in body))
      return res.status(403).send({ message: 'url is missing in body' })
    const { url } = body
    const typebotId = req.query.typebotId.toString()
    const stepId = req.query.stepId.toString()
    const typebot = (await prisma.typebot.findUnique({
      where: { id_ownerId: { id: typebotId, ownerId: user.id } },
    })) as Typebot | undefined
    if (!typebot) return res.status(400).send({ message: 'Typebot not found' })
    try {
      const updatedTypebot = addUrlToWebhookStep(url, typebot, stepId)
      await prisma.typebot.update({
        where: { id_ownerId: { id: typebotId, ownerId: user.id } },
        data: { blocks: updatedTypebot.blocks as Prisma.JsonArray },
      })
      return res.send({ message: 'success' })
    } catch (err) {
      return res
        .status(400)
        .send({ message: "stepId doesn't point to a Webhook step" })
    }
  }
  return methodNotAllowed(res)
}

const addUrlToWebhookStep = (
  url: string,
  typebot: Typebot,
  stepId: string
): Typebot => ({
  ...typebot,
  blocks: typebot.blocks.map((b) => ({
    ...b,
    steps: b.steps.map((s) => {
      if (s.id === stepId) {
        if (s.type !== IntegrationStepType.WEBHOOK) throw new Error()
        return {
          ...s,
          webhook: {
            ...s.webhook,
            url,
            method: HttpMethod.POST,
            body: '{{state}}',
          },
        }
      }
      return s
    }),
  })),
})

export default withSentry(handler)
