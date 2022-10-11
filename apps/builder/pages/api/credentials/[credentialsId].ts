import { withSentry } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from 'services/api/utils'
import { badRequest, methodNotAllowed, notAuthenticated } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser()
  if (!user) return notAuthenticated(res)
  // const workspaceId = req.query.workspaceId as string | undefined
  // if (!workspaceId) return badRequest(res)
  // if (req.method === 'DELETE') {
  //   const credentialsId = req.query.credentialsId.toString()
  //   const credentials = await prisma.credentials.deleteMany({
  //     where: {
  //       id: credentialsId,
  //       workspace: { id: workspaceId, members: { some: { userId: user.id } } },
  //     },
  //   })
  //   return res.send({ credentials })
  // }
  return methodNotAllowed(res)
}

export default withSentry(handler)
