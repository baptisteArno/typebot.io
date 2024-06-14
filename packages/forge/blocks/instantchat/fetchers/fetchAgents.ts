import { FetcherDefinition, AuthDefinition } from '@typebot.io/forge'

export const fetchAgents: FetcherDefinition<AuthDefinition, any> = {
  id: 'fetchAgents',
  dependencies: ['baseUrl', 'accountcode', 'wsKey'],
  fetch: async ({ credentials, options }) => {
    const { baseUrl, accountcode, wsKey } = credentials || {}
    let agents = []
    if (baseUrl && accountcode && wsKey) {
      const agentListResponse = await fetch(`${baseUrl}/ivws/instantrest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          AgentList: {
            key: wsKey,
            accountcode: accountcode,
          },
        }),
      })
      if (agentListResponse.status < 300 && agentListResponse.status >= 200) {
        const res = await agentListResponse.json()
        if (res.AgentListResult0 == 0) {
          for (const q of res.AgentListResult2) {
            const response = await fetch(`${baseUrl}/ivws/instantrest`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                AgentInfo: {
                  key: wsKey,
                  accountcode: accountcode,
                  user: q,
                },
              }),
            })

            if (response.status < 300 && response.status >= 200) {
              const agentInfo = await response.json()
              if (agentInfo.AgentInfoResult0 == 0) {
                agents.push({
                  label: `${agentInfo.AgentInfoResult2.user} - ${agentInfo.AgentInfoResult2.name}`,
                  value: agentInfo.AgentInfoResult2.user,
                })
              }
            }
          }
        }
      }
    }
    return agents
  },
}
