import { stringify } from 'qs'

export const getGoogleSheetsConsentScreenUrlQuery = (
  redirectUrl: string,
  blockId: string,
  workspaceId?: string
) => {
  const queryParams = stringify({ redirectUrl, blockId, workspaceId })
  return `/api/credentials/google-sheets/consent-url?${queryParams}`
}
