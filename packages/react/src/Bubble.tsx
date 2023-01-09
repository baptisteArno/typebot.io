import { useEffect } from 'react'
import type { BubbleProps } from '@typebot.io/js'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'typebot-bubble': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >
    }
  }
}

export const Bubble = (props: BubbleProps) => {
  useEffect(() => {
    ;(async () => {
      const { registerBubbleComponent } = await import('@typebot.io/js')
      registerBubbleComponent(props)
    })()
  }, [props])

  return <typebot-bubble />
}
