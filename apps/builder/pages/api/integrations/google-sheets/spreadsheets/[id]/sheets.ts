import { NextApiRequest, NextApiResponse } from 'next'
import { GoogleSpreadsheet } from 'google-spreadsheet'
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

    const spreadsheetId = req.query.id.toString()
    const doc = new GoogleSpreadsheet(spreadsheetId)
    doc.useOAuth2Client(
      await getAuthenticatedGoogleClient(user.id, credentialsId)
    )
    await doc.loadInfo()
    return res.send({
      sheets: await Promise.all(
        Array.from(Array(doc.sheetCount)).map(async (_, idx) => {
          const sheet = doc.sheetsByIndex[idx]
          await sheet.loadHeaderRow()
          return {
            id: sheet.sheetId,
            name: sheet.title,
            columns: sheet.headerValues,
          }
        })
      ),
    })
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)
