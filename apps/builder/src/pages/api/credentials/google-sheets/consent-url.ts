import { oauth2Client } from '@/lib/googleSheets'
import { NextApiRequest, NextApiResponse } from 'next'

export const googleSheetsScopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.readonly',
]

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
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
