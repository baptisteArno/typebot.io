import { withSentry } from '@sentry/nextjs'
import { CustomDomain, Prisma, User } from 'db'
import { got, HTTPError } from 'got'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { methodNotAllowed } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })

  if (!session?.user)
    return res.status(401).json({ message: 'Not authenticated' })

  const user = session.user as User
  const id = req.query.id.toString()
  if (user.id !== id) return res.status(401).send({ message: 'Forbidden' })
  if (req.method === 'GET') {
    const customDomains = await prisma.customDomain.findMany({
      where: { ownerId: user.id },
    })
    return res.send({ customDomains })
  }
  if (req.method === 'POST') {
    const data = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as Omit<CustomDomain, 'ownerId'>
    try {
      await createDomainOnVercel(data.name)
    } catch (err) {
      if (err instanceof HTTPError && err.response.statusCode !== 409)
        return res.status(err.response.statusCode).send(err.response.body)
    }

    const customDomains = await prisma.customDomain.create({
      data: {
        ...data,
        ownerId: user.id,
      } as Prisma.CustomDomainUncheckedCreateInput,
    })
    return res.send({ customDomains })
  }
  return methodNotAllowed(res)
}

const createDomainOnVercel = (name: string) =>
  got.post({
    url: `https://api.vercel.com/v8/projects/${process.env.VERCEL_VIEWER_PROJECT_NAME}/domains?teamId=${process.env.VERCEL_TEAM_ID}`,
    headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
    json: { name },
  })

export default withSentry(handler)
