import { headers, services } from '@octadesk-tech/services'
import { withSentry } from '@sentry/nextjs'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from 'services/api/utils'
import { methodNotAllowed, notAuthenticated } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  try {
    if (req.method === 'POST') {
      const client = await services.chatBots.getClient()
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      const botId = data.id

      await client.put(`${botId}`, { bot: data }, headers.getAuthorizedHeaders())
      const publishBotResponse = await client.put(`${botId}/publish`, headers.getAuthorizedHeaders())

      return res.send(publishBotResponse.data)
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
