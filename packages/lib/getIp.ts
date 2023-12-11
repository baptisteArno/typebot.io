import { NextApiRequest } from 'next'

export const getIp = (req: NextApiRequest): string | undefined => {
  let ip = req.headers['x-real-ip'] as string | undefined
  if (!ip) {
    const forwardedFor = req.headers['x-forwarded-for']
    if (Array.isArray(forwardedFor)) {
      ip = forwardedFor.at(0)
    } else {
      ip = forwardedFor?.split(',').at(0)
    }
  }
  return ip
}
