import { NextApiRequest, NextApiResponse } from 'next'

export const methodNotAllowed = (res: NextApiResponse) =>
  res.status(405).json({ message: 'Method Not Allowed' })

export const notAuthenticated = (res: NextApiResponse) =>
  res.status(401).json({ message: 'Not authenticated' })

export const notFound = (res: NextApiResponse) =>
  res.status(404).json({ message: 'Not found' })

export const badRequest = (res: NextApiResponse) =>
  res.status(400).json({ message: 'Bad Request' })

export const forbidden = (res: NextApiResponse) =>
  res.status(403).json({ message: 'Bad Request' })

export const initMiddleware =
  (
    handler: (
      req: NextApiRequest,
      res: NextApiResponse,
      middleware: (result: any) => void
    ) => void
  ) =>
  (req: any, res: any) =>
    new Promise((resolve, reject) => {
      handler(req, res, (result) => {
        if (result instanceof Error) {
          return reject(result)
        }
        return resolve(result)
      })
    })
