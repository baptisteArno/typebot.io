import { NextApiRequest, NextApiResponse } from 'next'
import { drive } from '@googleapis/drive'
import { getAuthenticatedGoogleClient } from 'libs/google-sheets'
import { methodNotAllowed } from 'utils'
import { getSession } from 'next-auth/react'
import { User } from 'db'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })

  if (!session?.user)
    return res.status(401).json({ message: 'Not authenticated' })

  const user = session.user as User
  if (req.method === 'GET') {
    const credentialsId = req.query.credentialsId.toString()
    const auth = await getAuthenticatedGoogleClient(user.id, credentialsId)
    const { data } = await drive({
      version: 'v3',
      auth,
    }).files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'nextPageToken, files(id, name)',
    })
    return res.send(data)
  }
  return methodNotAllowed(res)
}

export default handler
