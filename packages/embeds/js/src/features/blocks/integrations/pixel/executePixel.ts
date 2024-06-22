import { trackPixelEvent } from '@/lib/pixel'
import { isEmpty } from '@sniper.io/lib/utils'
import type { PixelBlock } from '@sniper.io/schemas'

export const executePixel = async (options: PixelBlock['options']) => {
  if (isEmpty(options?.pixelId)) return
  trackPixelEvent(options)
}
