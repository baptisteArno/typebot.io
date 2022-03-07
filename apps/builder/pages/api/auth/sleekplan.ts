import { withSentry } from '@sentry/nextjs'
import { User } from 'db'
import { sign } from 'jsonwebtoken'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthenticatedUser } from 'services/api/utils'
import { methodNotAllowed, notAuthenticated } from 'utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const user = await getAuthenticatedUser(req)
    if (!user) return notAuthenticated(res)
    const ssoToken = createSSOToken(user)
    res.redirect(`https://feedback.typebot.io?sso=${ssoToken}`)
    return
  }
  methodNotAllowed(res)
}

const createSSOToken = (user: User) => {
  if (!process.env.SLEEKPLAN_SSO_KEY) return
  const userData = {
    mail: user.email,
    id: user.id,
    name: user.name,
    img: user.image,
  }

  return sign(userData, process.env.SLEEKPLAN_SSO_KEY, { algorithm: 'HS256' })
}

export default withSentry(handler)
