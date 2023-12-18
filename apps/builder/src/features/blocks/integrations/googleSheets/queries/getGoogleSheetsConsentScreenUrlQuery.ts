import { stringify } from 'qs'

export const getGoogleSheetsConsentScreenUrlQuery = (
  redirectUrl: string,
  blockId: string,
  workspaceId?: string,
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
