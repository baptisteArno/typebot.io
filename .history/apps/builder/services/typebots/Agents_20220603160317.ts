import { getAuthorizedHeaders, sendRequest } from 'utils'

export const agents = (
  authorize: getAuthorizedHeaders
) =>
  sendRequest({
    method: 'GET',
    url: `https://chat.qaoctadesk.services/api/agents`,
    body: authorize,
  })
