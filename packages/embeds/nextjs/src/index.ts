import type {
  BotProps,
  PopupProps,
  BubbleProps,
} from '@typebot.io/js/dist/index'
import dynamic from 'next/dynamic.js'

export const Standard: React.ComponentType<
  BotProps & {
    style?: React.CSSProperties
    className?: string
  }
> = dynamic(() => import('@typebot.io/react/src/Standard'), { ssr: false })

export const Popup: React.ComponentType<PopupProps> = dynamic(
  () => import('@typebot.io/react/src/Popup'),
  {
    ssr: false,
  }
)

export const Bubble: React.ComponentType<BubbleProps> = dynamic(
  () => import('@typebot.io/react/src/Bubble'),
  {
    ssr: false,
  }
)

export * from '@typebot.io/js'
