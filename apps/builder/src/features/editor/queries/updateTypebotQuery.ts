import { Typebot } from '@typebot.io/schemas'
import { sendRequest } from '@typebot.io/lib'

export const updateTypebotQuery = async (id: string, typebot: Typebot) =>
  sendRequest<{ typebot: Typebot }>({
    url: `/api/typebots/${id}`,
    method: 'PUT',
    body: typebot,
  })
