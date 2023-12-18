import { TRPCError } from '@trpc/server'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { getAuthenticatedGoogleClient } from '@typebot.io/lib/google'

export const getAuthenticatedGoogleDoc = async ({
  credentialsId,
  spreadsheetId,
}: {
  credentialsId?: string
  spreadsheetId?: string
}) => {
  if (!credentialsId || !spreadsheetId)
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Missing credentialsId or spreadsheetId',
    })
  const auth = await getAuthenticatedGoogleClient(credentialsId)
  if (!auth)
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: "Couldn't find credentials in database",
    })
  return new GoogleSpreadsheet(spreadsheetId, auth)
}
