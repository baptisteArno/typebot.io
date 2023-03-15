import { parseVariables } from '@/features/variables'
import { EdgeId, LogicState } from '@/types'
import { sendEventToParent } from '@/utils/chat'
import { RedirectBlock } from '@typebot.io/schemas'
import { sanitizeUrl } from '@typebot.io/lib'

export const executeRedirect = (
  block: RedirectBlock,
  { typebot: { variables } }: LogicState
): {
  nextEdgeId?: EdgeId
  blockedPopupUrl?: string
} => {
  if (!block.options?.url) return { nextEdgeId: block.outgoingEdgeId }
  const formattedUrl = sanitizeUrl(parseVariables(variables)(block.options.url))
  const isEmbedded = window.parent && window.location !== window.top?.location
  let newWindow: Window | null = null
  if (isEmbedded) {
    if (!block.options.isNewTab) {
      ;(window.top as Window).location.href = formattedUrl
      return { nextEdgeId: block.outgoingEdgeId }
    }

    try {
      newWindow = window.open(formattedUrl)
    } catch (err) {
      sendEventToParent({ redirectUrl: formattedUrl })
    }
  } else {
    newWindow = window.open(
      formattedUrl,
      block.options.isNewTab ? '_blank' : '_self'
    )
  }
  return {
    nextEdgeId: block.outgoingEdgeId,
    blockedPopupUrl: newWindow ? undefined : formattedUrl,
  }
}
