import { withSentry } from '@sentry/nextjs'
import { User } from 'db'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { methodNotAllowed } from 'utils'
import { got } from 'got'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })

  if (!session?.user)
    return res.status(401).json({ message: 'Not authenticated' })

  const user = session.user as User
  const id = req.query.id.toString()
  if (user.id !== id) return res.status(401).send({ message: 'Forbidden' })
  if (req.method === 'DELETE') {
    const domain = req.query.domain.toString()
    await deleteDomainOnVercel(domain)
    const customDomains = await prisma.customDomain.delete({
      where: { name: domain },
    })
    return res.send({ customDomains })
  }
  return methodNotAllowed(res)
}

const deleteDomainOnVercel = (name: string) =>
  got.delete({
    url: `https://api.vercel.com/v8/projects/${process.env.VERCEL_VIEWER_PROJECT_NAME}/domains/${name}?teamId=${process.env.VERCEL_TEAM_ID}`,
    headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
  })

export default withSentry(handler)
