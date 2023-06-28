import { ExecuteIntegrationResponse } from '@/features/chat/types'
import { deepParseVariables } from '@/features/variables/deepParseVariable'
import { PixelBlock, SessionState } from '@typebot.io/schemas'

export const executePixelBlock = (
  { typebot: { variables }, result }: SessionState,
  block: PixelBlock
): ExecuteIntegrationResponse => {
  if (!result) return { outgoingEdgeId: block.outgoingEdgeId }
  const pixel = deepParseVariables(variables, {
    guessCorrectTypes: true,
    removeEmptyStrings: true,
  })(block.options)
  return {
    outgoingEdgeId: block.outgoingEdgeId,
    clientSideActions: [
      {
        pixel: {
          ...pixel,
          pixelId: block.options.pixelId,
        },
      },
    ],
  }
}
