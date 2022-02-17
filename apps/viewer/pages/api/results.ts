import { withSentry } from '@sentry/nextjs'
import prisma from 'libs/prisma'
import { VariableWithValue } from 'models'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const resultData = JSON.parse(req.body) as {
      typebotId: string
      prefilledVariables: VariableWithValue[]
    }
    const result = await prisma.result.create({
      data: { ...resultData, isCompleted: false },
    })
    return res.send(result)
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)
