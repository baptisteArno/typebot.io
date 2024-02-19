import type {
  BotProps,
  PopupProps,
  BubbleProps,
} from '@flowdacity/js/dist/index'
import dynamic from 'next/dynamic'

export const Standard: React.ComponentType<
  BotProps & {
    style?: React.CSSProperties
    className?: string
  }
> = dynamic(() => import('@flowdacity/react/src/Standard'), { ssr: false })

export const Popup: React.ComponentType<PopupProps> = dynamic(
  () => import('@flowdacity/react/src/Popup'),
  {
    ssr: false,
  }
)

export const Bubble: React.ComponentType<BubbleProps> = dynamic(
  () => import('@flowdacity/react/src/Bubble'),
  {
    ssr: false,
  }
)

export * from '@flowdacity/js'
