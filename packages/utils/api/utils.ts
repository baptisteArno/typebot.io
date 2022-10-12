import { NextApiRequest, NextApiResponse } from 'next'

export const methodNotAllowed = (
  res: NextApiResponse,
  customMessage?: string
) => res.status(405).json({ message: customMessage ?? 'Method Not Allowed' })

export const notAuthenticated = (
  res: NextApiResponse,
  customMessage?: string
) => res.status(401).json({ message: customMessage ?? 'Not authenticated' })

export const notFound = (res: NextApiResponse, customMessage?: string) =>
  res.status(404).json({ message: customMessage ?? 'Not found' })

export const badRequest = (res: NextApiResponse, customMessage?: any) =>
  res.status(400).json({ message: customMessage ?? 'Bad Request' })

export const forbidden = (res: NextApiResponse, customMessage?: string) =>
  res.status(403).json({ message: customMessage ?? 'Forbidden' })

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
