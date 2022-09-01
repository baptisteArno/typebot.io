import { headers, services } from '@octadesk-tech/services'
import { withSentry } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from 'services/api/utils'
import { parseNewTypebot } from 'services/typebots/typebots'
import { badRequest, methodNotAllowed, notAuthenticated } from 'utils'
import Storage from '@octadesk-tech/storage'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser()
  if (!user) return notAuthenticated(res)
  try {
    if (req.method === 'GET') {
      const client = await services.chatBots.getClient()
      console.log("HEADERS => ", headers.getAuthorizedHeaders());

      console.log(Storage.getItem('userToken'))
      console.log(Storage.getItem('company'))

      const response = await client.get(`builder/all`, headers.getAuthorizedHeaders())
      return res.send({ typebots: response.data })
    }
    if (req.method === 'POST') {
      const client = await services.chatBots.getClient()
      const response = await client.post(``, { ...req.body, version: 2 }, headers.getAuthorizedHeaders())
      return res.send(response.data)
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
