import { stringify } from 'qs'

export const getGoogleSheetsConsentScreenUrlQuery = (
  redirectUrl: string,
  blockId: string,
  workspaceId?: string,
  sniperId?: string
) => {
  const queryParams = stringify({
    redirectUrl,
    blockId,
    workspaceId,
    sniperId,
  })
  return `/api/credentials/google-sheets/consent-url?${queryParams}`
}
