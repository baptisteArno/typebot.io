import { useEffect, useRef } from 'react'
import type { BubbleProps } from '@typebot.io/js'

type Props = BubbleProps

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'typebot-bubble': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { class?: string }
    }
  }
}

type BubbleElement = HTMLElement & Props

export const Bubble = (props: Props) => {
  const ref = useRef<BubbleElement | null>(null)

  useEffect(() => {
    ;(async () => {
      await import('@typebot.io/js/dist/web')
    })()
  }, [])

  const updateProps = (element: BubbleElement | null, props: Props) => {
    if (!element) return
    Object.assign(element, props)
  }

  const initBubble = async () => {
    const bubbleElement = document.createElement(
      'typebot-bubble'
    ) as BubbleElement
    ref.current = bubbleElement
    document.body.append(bubbleElement)
  }

  useEffect(() => {
    ;(async () => {
      if (!ref.current) await initBubble()
      updateProps(ref.current, props)
    })()

    return () => {
      ref.current?.remove()
    }
  }, [props])

  return null
}
