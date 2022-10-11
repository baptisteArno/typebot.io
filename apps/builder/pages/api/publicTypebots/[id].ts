import { withSentry } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from 'services/api/utils'
import { methodNotAllowed, notAuthenticated } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser()
  if (!user) return notAuthenticated(res)

  // const id = req.query.id.toString()
  // if (req.method === 'PUT') {
  //   const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  //   const typebots = await prisma.publicTypebot.update({
  //     where: { id },
  //     data,
  //   })
  //   return res.send({ typebots })
  // }
  return methodNotAllowed(res)
}

export default withSentry(handler)
