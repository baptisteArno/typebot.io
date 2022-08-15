import { withSentry } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { canEditGuests } from 'services/api/dbRules'
import { getAuthenticatedUser } from 'services/api/utils'
import { methodNotAllowed, notAuthenticated } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser()
  if (!user) return notAuthenticated(res)
  // const typebotId = req.query.typebotId as string
  // const userId = req.query.userId as string
  // if (req.method === 'PATCH') {
  //   const data = req.body
  //   await prisma.collaboratorsOnTypebots.updateMany({
  //     where: { userId, typebot: canEditGuests(user, typebotId) },
  //     data: { type: data.type },
  //   })
  //   return res.send({
  //     message: 'success',
  //   })
  // }
  // if (req.method === 'DELETE') {
  //   await prisma.collaboratorsOnTypebots.deleteMany({
  //     where: { userId, typebot: canEditGuests(user, typebotId) },
  //   })
  //   return res.send({
  //     message: 'success',
  //   })
  // }
  methodNotAllowed(res)
}

export default withSentry(handler)
