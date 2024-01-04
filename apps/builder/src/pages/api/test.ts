import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await new Promise((resolve) => setTimeout(resolve, 11000))
  res.status(200).json({ name: 'John Doe' })
}
