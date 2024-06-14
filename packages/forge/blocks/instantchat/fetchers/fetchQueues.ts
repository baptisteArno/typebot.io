import { FetcherDefinition, AuthDefinition } from '@typebot.io/forge'

const parseQueueName = (queue: string) => {
  const queueName = queue.split('_')[1]
  return queueName
}

export const fetchQueues: FetcherDefinition<AuthDefinition, any> = {
  id: 'fetchQueues',
  dependencies: ['baseUrl', 'accountcode', 'wsKey'],
  fetch: async ({ credentials, options }) => {
    const { baseUrl, accountcode, wsKey } = credentials || {}

    if (baseUrl && accountcode && wsKey) {
      const body = {
        AccountcodesQueuesInfo: {
          key: wsKey,
          accountcodes: [accountcode],
          media: 'c',
        },
      }

      const response = await fetch(`${baseUrl}/ivws/instantrest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      if (response.status < 300 && response.status >= 200) {
        const res = await response.json()
        if (res.AccountcodesQueuesInfoResult0 == 0) {
          return res.AccountcodesQueuesInfoResult2.map((q: any) => ({
            label: `${parseQueueName(q.name)}: ${q.description}`,
            value: parseQueueName(q.name),
          }))
        }
      }
    }
    return []
  },
}
