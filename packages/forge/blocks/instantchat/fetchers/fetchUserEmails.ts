import { FetcherDefinition, AuthDefinition } from '@typebot.io/forge'

export const fetchUserEmails: FetcherDefinition<AuthDefinition, any> = {
  id: 'fetchUserEmails',
  dependencies: ['baseUrl', 'kwikToken'],
  fetch: async ({ credentials, options }) => {
    const { baseUrl, kwikToken } = credentials
    const apiUrl = `${baseUrl}/api/api/public/v1/user_emails/`
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
