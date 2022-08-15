import { withSentry } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { canReadTypebot } from 'services/api/dbRules'
import { getAuthenticatedUser } from 'services/api/utils'
import { methodNotAllowed, notAuthenticated } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser()
  if (!user) return notAuthenticated(res)
  // const typebotId = req.query.typebotId as string
  // if (req.method === 'GET') {
  //   const collaborators = await prisma.collaboratorsOnTypebots.findMany({
  //     where: { typebot: canReadTypebot(typebotId, user) },
  //     include: { user: { select: { name: true, image: true, email: true } } },
  //   })
  //   return res.send({
  //     collaborators,
  //   })
  // }
  methodNotAllowed(res)
}

export default withSentry(handler)
