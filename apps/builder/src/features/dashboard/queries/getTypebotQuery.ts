import { Typebot } from '@typebot.io/schemas'
import { sendRequest } from '@typebot.io/lib'

export const getTypebotQuery = (typebotId: string) =>
  sendRequest<{ typebot: Typebot }>({
    url: `/api/typebots/${typebotId}`,
    method: 'GET',
  })
