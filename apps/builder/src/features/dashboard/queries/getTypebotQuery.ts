import { Typebot } from 'models'
import { sendRequest } from 'utils'

export const getTypebotQuery = (typebotId: string) =>
  sendRequest<{ typebot: Typebot }>({
    url: `/api/typebots/${typebotId}`,
    method: 'GET',
  })
