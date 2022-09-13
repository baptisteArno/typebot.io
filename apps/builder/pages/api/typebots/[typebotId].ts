import { withSentry } from '@sentry/nextjs'
import { CollaborationType } from 'model'
//import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { canReadTypebot, canWriteTypebot } from 'services/api/dbRules'
import { getAuthenticatedUser } from 'services/api/utils'
import { methodNotAllowed, notAuthenticated } from 'utils'
import { services } from '@octadesk-tech/services'
import { headers } from '@octadesk-tech/services'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser()
  if (!user) return notAuthenticated(res)

  const typebotId = req.query.typebotId as string
  if (req.method === 'GET') {
    // const client = await services.chatBots.getClient()
    
    // const response = await client.get(`builder/${typebotId}`, headers.getAuthorizedHeaders())
    // const typebot = response.data
    // if (!typebot) return res.send({ typebot: null })
    
    // const { publishedTypebot, webhooks, ...restOfTypebot } = typebot
    // return res.send({
    //   typebot: restOfTypebot,
    //   publishedTypebot,
    //   isReadOnly: false,
    //   webhooks,
    // })
  }

  if (req.method === 'DELETE') {
    const client = await services.chatBots.getClient()
    //TODO - METODO DE INATIVAR BOT
    const response = await client.get(`builder/cl4ofndsh0175tmvtf3mrgjvd`, headers.getAuthorizedHeaders())
    //const typebot = response.data
    // const typebots = await prisma.typebot.deleteMany({
    //   where: canWriteTypebot(typebotId, user),
    // })
    //return res.send({ typebots })

    return res.send({})
  }

  if (['PUT', 'PATCH'].includes(req.method || '')) {
    const client = await services.chatBots.getClient()
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body

    const response = await client.put(`${typebotId}`, { bot: data }, headers.getAuthorizedHeaders())
    return res.send({ typebots: [response.data] })
  }

  return methodNotAllowed(res)
}

export default withSentry(handler)
