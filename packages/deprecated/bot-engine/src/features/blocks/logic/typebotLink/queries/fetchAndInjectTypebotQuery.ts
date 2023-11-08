import { LinkedTypebot } from '@/providers/TypebotProvider'
import { LogicState } from '@/types'
import { TypebotLinkBlock, Typebot, PublicTypebot } from '@typebot.io/schemas'
import { sendRequest } from '@typebot.io/lib'

export const fetchAndInjectTypebot = async (
  block: TypebotLinkBlock,
  { apiHost, injectLinkedTypebot, isPreview }: LogicState
): Promise<LinkedTypebot | undefined> => {
  const { data, error } = isPreview
    ? await sendRequest<{ typebot: Typebot }>(
        `/api/typebots/${block.options?.typebotId}`
      )
    : await sendRequest<{ typebot: PublicTypebot }>(
        `${apiHost}/api/publicTypebots/${block.options?.typebotId}`
      )
  if (!data || error) return
  return injectLinkedTypebot(data.typebot)
}
