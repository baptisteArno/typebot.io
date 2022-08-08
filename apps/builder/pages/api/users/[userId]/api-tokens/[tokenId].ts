import { withSentry } from '@sentry/nextjs'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from 'services/api/utils'
import { methodNotAllowed, notAuthenticated } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req)
  if (!user) return notAuthenticated(res)

  if (req.method === 'DELETE') {
    const id = req.query.tokenId as string
    const apiToken = await prisma.apiToken.delete({
      where: { id },
    })
    return res.send({ apiToken })
  }
  methodNotAllowed(res)
}

export default withSentry(handler)
