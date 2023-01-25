import { useEffect, useRef } from 'react'
import type { PopupProps } from '@typebot.io/js'

type Props = PopupProps

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'typebot-popup': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { class?: string }
    }
  }
}

type PopupElement = HTMLElement & Props

export const Popup = (props: Props) => {
  const ref = useRef<PopupElement | null>(null)

  useEffect(() => {
    ;(async () => {
      await import('@typebot.io/js/dist/web')
    })()
  }, [])

  const updateProps = (element: PopupElement | null, props: Props) => {
    if (!element) return
    Object.assign(element, props)
  }

  const initBubble = async () => {
    const popupElement = document.createElement('typebot-popup') as PopupElement
    ref.current = popupElement
    document.body.append(popupElement)
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
