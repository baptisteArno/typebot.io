import NextAuthApiAutomaticHandler from './subauth'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthOptions } from '../auth/[...nextauth]'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let restricted: 'rate-limited' | undefined
  const ret = await NextAuthApiAutomaticHandler(
    req,
    res,
    getAuthOptions({ restricted })
  )
  return ret
}

export default handler
