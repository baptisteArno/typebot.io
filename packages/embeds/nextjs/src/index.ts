import type {
  BotProps,
  PopupProps,
  BubbleProps,
} from '@sniper.io/js/dist/index'
import dynamic from 'next/dynamic'

export const Standard: React.ComponentType<
  BotProps & {
    style?: React.CSSProperties
    className?: string
  }
> = dynamic(() => import('@sniper.io/react/src/Standard'), { ssr: false })

export const Popup: React.ComponentType<PopupProps> = dynamic(
  () => import('@sniper.io/react/src/Popup'),
  {
    ssr: false,
  }
)

export const Bubble: React.ComponentType<BubbleProps> = dynamic(
  () => import('@sniper.io/react/src/Bubble'),
  {
    ssr: false,
  }
)

export * from '@sniper.io/js'
