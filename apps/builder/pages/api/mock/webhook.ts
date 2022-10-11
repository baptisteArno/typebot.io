import { withSentry } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from 'utils'

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const firstParam = req.query.firstParam as string
    const secondParam = req.query.secondParam as string
    const customHeader = req.headers['custom-typebot']
    const { body } = req
    if (
      body.customField === 'secret4' &&
      customHeader === 'secret3' &&
      secondParam === 'secret2' &&
      firstParam === 'secret1'
    ) {
      return res.status(200).send([
        { name: 'John', age: 21 },
        { name: 'Tim', age: 52 },
      ])
    }
    return res.status(400).send({ message: 'Bad request' })
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)
