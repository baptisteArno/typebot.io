import { Typebot } from 'models'
import { sendRequest } from 'utils'

export const updateTypebotQuery = async (id: string, typebot: Typebot) =>
  sendRequest<{ typebot: Typebot }>({
    url: `/api/typebots/${id}`,
    method: 'PUT',
    body: typebot,
  })
