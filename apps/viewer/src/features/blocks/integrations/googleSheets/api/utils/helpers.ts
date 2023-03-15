import { parseVariables } from '@/features/variables'
import { getAuthenticatedGoogleClient } from '@/lib/google-sheets'
import { TRPCError } from '@trpc/server'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { Variable, Cell } from '@typebot.io/schemas'

export const parseCellValues =
  (variables: Variable[]) =>
  (cells: Cell[]): { [key: string]: string } =>
    cells.reduce((row, cell) => {
      return !cell.column || !cell.value
        ? row
        : {
            ...row,
            [cell.column]: parseVariables(variables)(cell.value),
          }
    }, {})

export const getAuthenticatedGoogleDoc = async ({
  credentialsId,
  spreadsheetId,
}: {
  credentialsId?: string
  spreadsheetId?: string
}) => {
  if (!credentialsId)
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Missing credentialsId or sheetId',
    })
  const doc = new GoogleSpreadsheet(spreadsheetId)
  const auth = await getAuthenticatedGoogleClient(credentialsId)
  if (!auth)
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: "Couldn't find credentials in database",
    })
  doc.useOAuth2Client(auth)
  return doc
}
