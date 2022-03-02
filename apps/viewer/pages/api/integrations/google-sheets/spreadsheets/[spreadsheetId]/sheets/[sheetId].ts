import { NextApiRequest, NextApiResponse } from 'next'
import { badRequest, initMiddleware, methodNotAllowed } from 'utils'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { getAuthenticatedGoogleClient } from 'libs/google-sheets'
import { Cell } from 'models'
import Cors from 'cors'
import { withSentry } from '@sentry/nextjs'

const cors = initMiddleware(Cors())
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)
  if (req.method === 'GET') {
    const spreadsheetId = req.query.spreadsheetId.toString()
    const sheetId = req.query.sheetId.toString()
    const credentialsId = req.query.credentialsId.toString()
    const referenceCell = {
      column: req.query['referenceCell[column]'],
      value: req.query['referenceCell[value]'],
    } as Cell

    const extractingColumns = getExtractingColumns(
      req.query.columns as string[] | string | undefined
    )
    if (!extractingColumns) return badRequest(res)
    const doc = new GoogleSpreadsheet(spreadsheetId)
    doc.useOAuth2Client(await getAuthenticatedGoogleClient(credentialsId))
    await doc.loadInfo()
    const sheet = doc.sheetsById[sheetId]
    const rows = await sheet.getRows()
    const row = rows.find(
      (row) => row[referenceCell.column as string] === referenceCell.value
    )
    if (!row) return res.status(404).send({ message: "Couldn't find row" })
    return res.send({
      ...extractingColumns.reduce(
        (obj, column) => ({ ...obj, [column]: row[column] }),
        {}
      ),
    })
  }
  if (req.method === 'POST') {
    const spreadsheetId = req.query.spreadsheetId.toString()
    const sheetId = req.query.sheetId.toString()
    const { credentialsId, values } = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as {
      credentialsId: string
      values: { [key: string]: string }
    }
    const doc = new GoogleSpreadsheet(spreadsheetId)
    doc.useOAuth2Client(await getAuthenticatedGoogleClient(credentialsId))
    await doc.loadInfo()
    const sheet = doc.sheetsById[sheetId]
    await sheet.addRow(values)
    return res.send({ message: 'Success' })
  }
  if (req.method === 'PATCH') {
    const spreadsheetId = req.query.spreadsheetId.toString()
    const sheetId = req.query.sheetId.toString()
    const { credentialsId, values, referenceCell } = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as {
      credentialsId: string
      referenceCell: Cell
      values: { [key: string]: string }
    }
    const doc = new GoogleSpreadsheet(spreadsheetId)
    doc.useOAuth2Client(await getAuthenticatedGoogleClient(credentialsId))
    await doc.loadInfo()
    const sheet = doc.sheetsById[sheetId]
    const rows = await sheet.getRows()
    const updatingRowIndex = rows.findIndex(
      (row) => row[referenceCell.column as string] === referenceCell.value
    )
    if (updatingRowIndex === -1)
      return res.status(404).send({ message: "Couldn't find row to update" })
    for (const key in values) {
      rows[updatingRowIndex][key] = values[key]
    }
    await rows[updatingRowIndex].save()
    return res.send({ message: 'Success' })
  }
  return methodNotAllowed(res)
}

const getExtractingColumns = (columns: string | string[] | undefined) => {
  if (typeof columns === 'string') return [columns]
  if (Array.isArray(columns)) return columns
}

export default withSentry(handler)
