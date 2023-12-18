import { env } from '@typebot.io/env'
import { OAuth2Client } from 'google-auth-library'
import { NextApiRequest, NextApiResponse } from 'next'

export const googleSheetsScopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
]

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const oauth2Client = new OAuth2Client(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      `${env.NEXTAUTH_URL}/api/credentials/google-sheets/callback`
    )
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: googleSheetsScopes,
      prompt: 'consent',
      state: Buffer.from(JSON.stringify(req.query)).toString('base64'),
    })
    res.status(301).redirect(url)
  }
}

export default handler
