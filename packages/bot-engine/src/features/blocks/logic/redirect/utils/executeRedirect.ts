import { parseVariables } from '@/features/variables'
import { EdgeId, LogicState } from '@/types'
import { sendEventToParent } from '@/utils/chat'
import { RedirectBlock } from 'models'
import { sanitizeUrl } from 'utils'

export const executeRedirect = (
  block: RedirectBlock,
  { typebot: { variables } }: LogicState
): EdgeId | undefined => {
  if (!block.options?.url) return block.outgoingEdgeId
  const formattedUrl = sanitizeUrl(parseVariables(variables)(block.options.url))
  const isEmbedded = window.parent && window.location !== window.top?.location
  if (isEmbedded) {
    if (!block.options.isNewTab)
      return ((window.top as Window).location.href = formattedUrl)

    try {
      window.open(formattedUrl)
    } catch (err) {
      sendEventToParent({ redirectUrl: formattedUrl })
    }
  } else {
    window.open(formattedUrl, block.options.isNewTab ? '_blank' : '_self')
  }
  return block.outgoingEdgeId
}
