import { PixelBlock, SessionState } from '@sniper.io/schemas'
import { ExecuteIntegrationResponse } from '../../../types'
import { deepParseVariables } from '@sniper.io/variables/deepParseVariables'

export const executePixelBlock = (
  state: SessionState,
  block: PixelBlock
): ExecuteIntegrationResponse => {
  const { sniper, resultId } = state.snipersQueue[0]
  if (
    !resultId ||
    !block.options?.pixelId ||
    !block.options.eventType ||
    state.whatsApp
  )
    return { outgoingEdgeId: block.outgoingEdgeId }
  const pixel = deepParseVariables(sniper.variables, {
    guessCorrectTypes: true,
    removeEmptyStrings: true,
  })(block.options)
  return {
    outgoingEdgeId: block.outgoingEdgeId,
    clientSideActions: [
      {
        type: 'pixel',
        pixel: {
          ...pixel,
          pixelId: block.options.pixelId,
        },
      },
    ],
  }
}
