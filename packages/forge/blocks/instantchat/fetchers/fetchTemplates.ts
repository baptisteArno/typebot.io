import { FetcherDefinition, AuthDefinition } from '@typebot.io/forge'

export const fetchTemplates: FetcherDefinition<AuthDefinition, any> = {
  id: 'fetchTemplates',
  dependencies: ['baseUrl', 'kwikToken'],
  fetch: async ({ credentials, options }) => {
    const { baseUrl, kwikToken } = options
    const apiUrl = `${baseUrl}/api/api/public/v1/templates/`
    const apiResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Token ${kwikToken}`,
      },
    })

    if (apiResponse.status < 300 && apiResponse.status >= 200) {
      const res = await apiResponse.json()
      return res.map((t: any) => {
        let val = {
          name: t.name,
          headerImage: undefined,
        }

        if (t.name == 'webinar_2023') console.log(t)

        t.components.forEach((c: any) => {
          if (c.type === 'HEADER' && c.format === 'IMAGE') {
            val.headerImage = c.example?.header_handle[0]
          }
        })

        return {
          label: t.name,
          value: JSON.stringify(val),
        }
      })
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
