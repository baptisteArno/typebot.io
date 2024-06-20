import { Variable, HttpResponse } from '@sniper.io/schemas'
import { sendRequest } from '@sniper.io/lib'

export const executeWebhook = (
  sniperId: string,
  variables: Variable[],
  { blockId }: { blockId: string }
) =>
  sendRequest<HttpResponse>({
    url: `/api/snipers/${sniperId}/blocks/${blockId}/testWebhook`,
    method: 'POST',
    body: {
      variables,
    },
  })
