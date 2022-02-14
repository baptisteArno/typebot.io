import { withSentry } from '@sentry/nextjs'
import { Prisma, User } from 'db'
import prisma from 'libs/prisma'
import { Credentials } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { encrypt, methodNotAllowed } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })

  if (!session?.user)
    return res.status(401).json({ message: 'Not authenticated' })

  const user = session.user as User
  const id = req.query.id.toString()
  if (user.id !== id) return res.status(401).send({ message: 'Forbidden' })
  if (req.method === 'GET') {
    const credentials = await prisma.credentials.findMany({
      where: { ownerId: user.id },
      select: { name: true, type: true, ownerId: true, id: true },
    })
    return res.send({ credentials })
  }
  if (req.method === 'POST') {
    const data = JSON.parse(req.body) as Omit<Credentials, 'ownerId'>
    const { encryptedData, iv } = encrypt(data.data)
    const credentials = await prisma.credentials.create({
      data: {
        ...data,
        data: encryptedData,
        iv,
        ownerId: user.id,
      } as Prisma.CredentialsUncheckedCreateInput,
    })
    return res.send({ credentials })
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)
