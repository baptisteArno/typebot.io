import { trackPixelEvent } from '@/lib/pixel'
import { isEmpty } from '@typebot.io/lib/utils'
import type { PixelBlock } from '@typebot.io/schemas'

export const executePixel = async (options: PixelBlock['options']) => {
  if (isEmpty(options?.pixelId)) return
  trackPixelEvent(options)
}
