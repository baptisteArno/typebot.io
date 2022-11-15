import { Typebot } from 'db'
import { sendRequest } from 'utils'

export const patchTypebotQuery = async (
  id: string,
  typebot: Partial<Typebot>
) =>
  sendRequest({
    url: `/api/typebots/${id}`,
    method: 'PATCH',
    body: typebot,
  })
