import { NextApiRequest, NextApiResponse } from 'next'
import { drive } from '@googleapis/drive'
import { getAuthenticatedGoogleClient } from 'libs/google-sheets'
import { methodNotAllowed } from 'utils'
import { getSession } from 'next-auth/react'
import { User } from 'db'
import { withSentry } from '@sentry/nextjs'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })

  if (!session?.user)
    return res.status(401).json({ message: 'Not authenticated' })

  const user = session.user as User
  if (req.method === 'GET') {
    const credentialsId = req.query.credentialsId.toString()
    const auth = await getAuthenticatedGoogleClient(user.id, credentialsId)
    const response = await drive({
      version: 'v3',
      auth,
    }).files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'nextPageToken, files(id, name)',
    })
    return res.send(response.data)
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)
