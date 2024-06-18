import { authenticateUser } from '@/helpers/authenticateUser'
import { NextApiRequest, NextApiResponse } from 'next'
import { isNotDefined } from '@sniper.io/lib'
import { methodNotAllowed } from '@sniper.io/lib/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const user = await authenticateUser(req)
    if (isNotDefined(user))
      return res.status(404).send({ message: 'User not found' })
    return res.send({ id: user.id, email: user.email })
  }
  return methodNotAllowed(res)
}

export default handler
