import { withSentry } from '@sentry/nextjs'
import { Log } from 'db'
import prisma from 'libs/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { badRequest, methodNotAllowed } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const resultId = req.query.resultId as string
    const log = req.body as
      | Omit<Log, 'id' | 'createdAt' | 'resultId'>
      | undefined
    if (!log) return badRequest(res)
    const createdLog = await prisma.log.create({ data: { ...log, resultId } })
    return res.send(createdLog)
  }
  methodNotAllowed(res)
}

export default withSentry(handler)
