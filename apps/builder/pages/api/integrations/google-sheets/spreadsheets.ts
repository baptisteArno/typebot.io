import { NextApiRequest, NextApiResponse } from 'next'
import { drive } from '@googleapis/drive'
import { OAuth2Client } from 'googleapis-common'
import { getAuthenticatedGoogleClient } from 'libs/google-sheets'
import { badRequest, methodNotAllowed, notAuthenticated } from 'utils'
import { setUser, withSentry } from '@sentry/nextjs'
import { getAuthenticatedUser } from 'services/api/utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser()
  if (!user) return notAuthenticated(res)

  setUser({ email: user.email ?? undefined, id: user.id })
  if (req.method === 'GET') {
    const credentialsId = req.query.credentialsId as string | undefined
    if (!credentialsId) return badRequest(res)
    const auth = await getAuthenticatedGoogleClient(user.id, credentialsId)
    if (!auth)
      return res.status(404).send("Couldn't find credentials in database")
    const response = await drive({
      version: 'v3',
      auth: auth.client as unknown as OAuth2Client,
    }).files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'nextPageToken, files(id, name)',
    })
    return res.send(response.data)
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)
