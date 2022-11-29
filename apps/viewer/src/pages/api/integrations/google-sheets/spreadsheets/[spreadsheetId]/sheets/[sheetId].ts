import { NextApiRequest, NextApiResponse } from 'next'
import { badRequest, initMiddleware, methodNotAllowed } from 'utils/api'
import { hasValue } from 'utils'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { Cell } from 'models'
import Cors from 'cors'
import { withSentry } from '@sentry/nextjs'
import { getAuthenticatedGoogleClient } from '@/lib/google-sheets'
import { saveErrorLog, saveSuccessLog } from '@/features/logs/api'

const cors = initMiddleware(Cors())
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)
  const resultId = req.query.resultId as string | undefined
  if (req.method === 'GET') {
    const spreadsheetId = req.query.spreadsheetId as string
    const sheetId = req.query.sheetId as string
    const credentialsId = req.query.credentialsId as string | undefined
    if (!hasValue(credentialsId)) return badRequest(res)
    const referenceCell = {
      column: req.query['referenceCell[column]'],
      value: req.query['referenceCell[value]'],
    } as Cell

    const extractingColumns = getExtractingColumns(
      req.query.columns as string[] | string | undefined
    )
    if (!extractingColumns) return badRequest(res)
    const doc = new GoogleSpreadsheet(spreadsheetId)
    const client = await getAuthenticatedGoogleClient(credentialsId)
    if (!client)
      return res.status(404).send("Couldn't find credentials in database")
    doc.useOAuth2Client(client)
    await doc.loadInfo()
    const sheet = doc.sheetsById[sheetId]
    try {
      const rows = await sheet.getRows()
      const row = rows.find(
        (row) => row[referenceCell.column as string] === referenceCell.value
      )
      if (!row) {
        await saveErrorLog({
          resultId,
          message: "Couldn't find reference cell",
        })
        return res.status(404).send({ message: "Couldn't find row" })
      }
      const response = {
        ...extractingColumns.reduce(
          (obj, column) => ({ ...obj, [column]: row[column] }),
          {}
        ),
      }
      await saveSuccessLog({
        resultId,
        message: 'Succesfully fetched spreadsheet data',
      })
      return res.send(response)
    } catch (err) {
      await saveErrorLog({
        resultId,
        message: "Couldn't fetch spreadsheet data",
        details: err,
      })
      return res.status(500).send(err)
    }
  }
  if (req.method === 'POST') {
    const spreadsheetId = req.query.spreadsheetId as string
    const sheetId = req.query.sheetId as string
    const { credentialsId, values } = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as {
      credentialsId?: string
      values: { [key: string]: string }
    }
    if (!hasValue(credentialsId)) return badRequest(res)
    const doc = new GoogleSpreadsheet(spreadsheetId)
    const auth = await getAuthenticatedGoogleClient(credentialsId)
    if (!auth)
      return res.status(404).send("Couldn't find credentials in database")
    doc.useOAuth2Client(auth)
    try {
      await doc.loadInfo()
      const sheet = doc.sheetsById[sheetId]
      await sheet.addRow(values)
      await saveSuccessLog({ resultId, message: 'Succesfully inserted row' })
      return res.send({ message: 'Success' })
    } catch (err) {
      await saveErrorLog({
        resultId,
        message: "Couldn't fetch spreadsheet data",
        details: err,
      })
      return res.status(500).send(err)
    }
  }
  if (req.method === 'PATCH') {
    const spreadsheetId = req.query.spreadsheetId as string
    const sheetId = req.query.sheetId as string
    const { credentialsId, values, referenceCell } = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as {
      credentialsId?: string
      referenceCell: Cell
      values: { [key: string]: string }
    }
    if (!hasValue(credentialsId)) return badRequest(res)
    const doc = new GoogleSpreadsheet(spreadsheetId)
    const auth = await getAuthenticatedGoogleClient(credentialsId)
    if (!auth)
      return res.status(404).send("Couldn't find credentials in database")
    doc.useOAuth2Client(auth)
    try {
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
      await saveSuccessLog({ resultId, message: 'Succesfully updated row' })
      return res.send({ message: 'Success' })
    } catch (err) {
      await saveErrorLog({
        resultId,
        message: "Couldn't fetch spreadsheet data",
        details: err,
      })
      return res.status(500).send(err)
    }
  }
  return methodNotAllowed(res)
}

const getExtractingColumns = (columns: string | string[] | undefined) => {
  if (typeof columns === 'string') return [columns]
  if (Array.isArray(columns)) return columns
}

export default withSentry(handler)
