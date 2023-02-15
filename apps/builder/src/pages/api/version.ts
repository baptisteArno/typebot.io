import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  return res.send({ commitSha: process.env.VERCEL_GIT_COMMIT_SHA })
}

export default handler
