import { FetcherDefinition, AuthDefinition } from '@typebot.io/forge'

export const fetchSenders: FetcherDefinition<AuthDefinition, any> = {
  id: 'fetchSenders',
  dependencies: ['baseUrl', 'kwikToken'],
  fetch: async ({ credentials, options }) => {
    const { baseUrl, kwikToken } = credentials
    const apiUrl = `${baseUrl}/api/api/public/v1/senders/`
    const apiResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Token ${kwikToken}`,
      },
    })

    if (apiResponse.status < 300 && apiResponse.status >= 200) {
      return await apiResponse.json()
    } else {
      console.log(
        `${apiUrl} ERROR:`,
        apiResponse.status,
        apiResponse.statusText
      )
    }

    return []
  },
}
