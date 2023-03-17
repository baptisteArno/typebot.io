import { NextApiRequest, NextApiResponse } from 'next'
import {
  badRequest,
  initMiddleware,
  methodNotAllowed,
  notFound,
} from '@typebot.io/lib/api'
import { hasValue, isDefined } from '@typebot.io/lib'
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet'
import {
  ComparisonOperators,
  GoogleSheetsAction,
  GoogleSheetsGetOptions,
  GoogleSheetsInsertRowOptions,
  GoogleSheetsUpdateRowOptions,
  LogicalOperator,
} from '@typebot.io/schemas'
import Cors from 'cors'
import { getAuthenticatedGoogleClient } from '@/lib/google-sheets'
import { saveErrorLog } from '@/features/logs/saveErrorLog'
import { saveSuccessLog } from '@/features/logs/saveSuccessLog'

const cors = initMiddleware(Cors())

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)
  if (req.method !== 'POST') return methodNotAllowed(res)
  const action = req.body.action as GoogleSheetsAction | undefined
  if (!action) return badRequest(res, 'Missing action')
  switch (action) {
    case GoogleSheetsAction.GET: {
      return await getRows(req, res)
    }
    case GoogleSheetsAction.INSERT_ROW: {
      return await insertRow(req, res)
    }
    case GoogleSheetsAction.UPDATE_ROW: {
      return await updateRow(req, res)
    }
  }
}

const getRows = async (req: NextApiRequest, res: NextApiResponse) => {
  const sheetId = req.query.sheetId as string
  const spreadsheetId = req.query.spreadsheetId as string
  const { resultId, credentialsId, referenceCell, filter, columns } =
    req.body as GoogleSheetsGetOptions & {
      resultId?: string
      columns: string[] | string
    }

  if (!hasValue(credentialsId)) {
    badRequest(res)
    return
  }

  const extractingColumns = getExtractingColumns(columns)

  if (!extractingColumns) {
    badRequest(res)
    return
  }

  const doc = new GoogleSpreadsheet(spreadsheetId)
  const client = await getAuthenticatedGoogleClient(credentialsId)
  if (!client) {
    notFound(res, "Couldn't find credentials in database")
    return
  }
  doc.useOAuth2Client(client)
  await doc.loadInfo()
  const sheet = doc.sheetsById[sheetId]
  try {
    const rows = await sheet.getRows()
    const filteredRows = rows.filter((row) =>
      referenceCell
        ? row[referenceCell.column as string] === referenceCell.value
        : matchFilter(row, filter as NonNullable<typeof filter>)
    )
    if (filteredRows.length === 0) {
      await saveErrorLog({
        resultId,
        message: "Couldn't find reference cell",
      })
      notFound(res, "Couldn't find reference cell")
      return
    }
    const response = {
      rows: filteredRows.map((row) =>
        extractingColumns.reduce<{ [key: string]: string }>(
          (obj, column) => ({ ...obj, [column]: row[column] }),
          {}
        )
      ),
    }
    await saveSuccessLog({
      resultId,
      message: 'Succesfully fetched spreadsheet data',
    })
    res.status(200).send(response)
    return
  } catch (err) {
    await saveErrorLog({
      resultId,
      message: "Couldn't fetch spreadsheet data",
      details: err,
    })
    res.status(500).send(err)
    return
  }
}

const insertRow = async (req: NextApiRequest, res: NextApiResponse) => {
  const sheetId = req.query.sheetId as string
  const spreadsheetId = req.query.spreadsheetId as string
  const { resultId, credentialsId, values } =
    req.body as GoogleSheetsInsertRowOptions & {
      resultId?: string
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

const updateRow = async (req: NextApiRequest, res: NextApiResponse) => {
  const sheetId = req.query.sheetId as string
  const spreadsheetId = req.query.spreadsheetId as string
  const { resultId, credentialsId, values, referenceCell } =
    req.body as GoogleSheetsUpdateRowOptions & {
      resultId?: string
      values: { [key: string]: string }
    }
  if (!hasValue(credentialsId) || !referenceCell) return badRequest(res)
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

const matchFilter = (
  row: GoogleSpreadsheetRow,
  filter: NonNullable<GoogleSheetsGetOptions['filter']>
) => {
  return filter.logicalOperator === LogicalOperator.AND
    ? filter.comparisons.every(
        (comparison) =>
          comparison.column &&
          matchComparison(
            row[comparison.column],
            comparison.comparisonOperator,
            comparison.value
          )
      )
    : filter.comparisons.some(
        (comparison) =>
          comparison.column &&
          matchComparison(
            row[comparison.column],
            comparison.comparisonOperator,
            comparison.value
          )
      )
}

const matchComparison = (
  inputValue?: string,
  comparisonOperator?: ComparisonOperators,
  value?: string
) => {
  if (!inputValue || !comparisonOperator || !value) return false
  switch (comparisonOperator) {
    case ComparisonOperators.CONTAINS: {
      return inputValue.toLowerCase().includes(value.toLowerCase())
    }
    case ComparisonOperators.EQUAL: {
      return inputValue === value
    }
    case ComparisonOperators.NOT_EQUAL: {
      return inputValue !== value
    }
    case ComparisonOperators.GREATER: {
      return parseFloat(inputValue) > parseFloat(value)
    }
    case ComparisonOperators.LESS: {
      return parseFloat(inputValue) < parseFloat(value)
    }
    case ComparisonOperators.IS_SET: {
      return isDefined(inputValue) && inputValue.length > 0
    }
  }
}

const getExtractingColumns = (columns: string | string[] | undefined) => {
  if (typeof columns === 'string') return [columns]
  if (Array.isArray(columns)) return columns
}

export default handler
