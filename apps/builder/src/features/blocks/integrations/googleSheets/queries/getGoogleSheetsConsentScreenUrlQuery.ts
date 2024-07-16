import { stringify } from 'qs'

export const getGoogleSheetsConsentScreenUrlQuery = (
  redirectUrl: string,
  workspaceId: string,
  blockId?: string,
  typebotId?: string
) => {
  const queryParams = stringify({
    redirectUrl,
    blockId,
    workspaceId,
    typebotId,
  })
  return `/api/credentials/google-sheets/consent-url?${queryParams}`
}
