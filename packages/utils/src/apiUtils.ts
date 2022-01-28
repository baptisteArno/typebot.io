import { NextApiRequest, NextApiResponse } from 'next'

export const methodNotAllowed = (res: NextApiResponse) =>
  res.status(405).json({ message: 'Method Not Allowed' })

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
