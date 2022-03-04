import { withSentry } from '@sentry/nextjs'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from 'services/api/utils'
import { methodNotAllowed, notAuthenticated } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)
  const id = req.query.id.toString()
  if (user.id !== id) return res.status(401).send({ message: 'Forbidden' })
  if (req.method === 'DELETE') {
    const credentialsId = req.query.credentialsId.toString()
    const credentials = await prisma.credentials.delete({
      where: { id: credentialsId },
    })
    return res.send({ credentials })
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)
