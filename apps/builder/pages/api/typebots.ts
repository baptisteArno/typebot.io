import { headers, services } from '@octadesk-tech/services'
import { withSentry } from '@sentry/nextjs'
import { Prisma, WorkspaceRole } from 'db'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from 'services/api/utils'
import { parseNewTypebot } from 'services/typebots/typebots'
import { badRequest, methodNotAllowed, notAuthenticated } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  try {
    if (req.method === 'GET') {
      const client = await services.chatBots.getClient()
      const response = await client.get(`builder/all`, headers.getAuthorizedHeaders())
      return res.send({ typebots: response.data })
    }
    if (req.method === 'POST') {
      const data =
        typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      const typebot = await prisma.typebot.create({
        data:
          'blocks' in data
            ? data
            : (parseNewTypebot({
                ownerAvatarUrl: user.image,
                ...data,
              }) as Prisma.TypebotUncheckedCreateInput),
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
