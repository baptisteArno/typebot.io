import { useCallback, useEffect, useRef, useState } from 'react'
import type { BubbleProps } from '@typebot.io/js'

type Props = BubbleProps

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

type BubbleElement = HTMLElement & Props

export const Bubble = (props: Props) => {
  const ref = useRef<BubbleElement | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    ;(async () => {
      await import('@typebot.io/js/dist/web')
      setIsInitialized(true)
    })()
    return () => {
      ref.current?.remove()
    }
  }, [])

  const attachBubbleToDom = useCallback((props: Props) => {
    const bubbleElement = document.createElement(
      'typebot-bubble'
    ) as BubbleElement
    ref.current = bubbleElement
    injectPropsToElement(ref.current, props)
    document.body.append(ref.current)
  }, [])

  useEffect(() => {
    if (!isInitialized) return
    if (!ref.current) attachBubbleToDom(props)
    injectPropsToElement(ref.current as BubbleElement, props)
  }, [attachBubbleToDom, isInitialized, props])

  const injectPropsToElement = (element: BubbleElement, props: Props) => {
    Object.assign(element, props)
  }

  return null
}
