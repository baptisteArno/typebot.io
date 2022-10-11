import { withSentry } from '@sentry/nextjs'
import { CollaborationType } from 'model'
//import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from 'services/api/utils'
import {
  badRequest,
  forbidden,
  methodNotAllowed,
  notAuthenticated,
} from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser()
  if (!user) return notAuthenticated(res)
  const webhookId = req.query.webhookId as string
  if (req.method === 'GET') {
    // const webhook = await prisma.webhook.findFirst({
    //   where: {
    //     id: webhookId,
    //     typebot: {
    //       OR: [
    //         { workspace: { members: { some: { userId: user.id } } } },
    //         {
    //           collaborators: {
    //             some: {
    //               userId: user.id,
    //             },
    //           },
    //         },
    //       ],
    //     },
    //   },
    // })
    // return res.send({ webhook })
    return res.send({ })
  }
  if (req.method === 'PUT') {
    // const data = req.body
    // if (!('typebotId' in data)) return badRequest(res)
    // const typebot = await prisma.typebot.findFirst({
    //   where: {
    //     OR: [
    //       {
    //         id: data.typebotId,
    //         workspace: { members: { some: { userId: user.id } } },
    //       },
    //       {
    //         collaborators: {
    //           some: {
    //             userId: user.id,
    //             type: CollaborationType.WRITE,
    //           },
    //         },
    //       },
    //     ],
    //   },
    // })
    // if (!typebot) return forbidden(res)
    // const webhook = await prisma.webhook.upsert({
    //   where: {
    //     id: webhookId,
    //   },
    //   create: data,
    //   update: data,
    // })

    return res.send({ })
  }
  methodNotAllowed(res)
}

export default withSentry(handler)
