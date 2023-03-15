import { Typebot } from '@typebot.io/prisma'
import { sendRequest } from '@typebot.io/lib'

export const patchTypebotQuery = async (
  id: string,
  typebot: Partial<Typebot>
) =>
  sendRequest<{ typebot: Typebot }>({
    url: `/api/typebots/${id}`,
    method: 'PATCH',
    body: typebot,
  })
