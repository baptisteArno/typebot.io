import React, { useCallback, useEffect, useRef } from 'react'
import type { PopupProps } from '@typebot.io/js'
import '@typebot.io/js/dist/web'

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

  const attachPopupToDom = useCallback((props: Props) => {
    const popupElement = document.createElement('typebot-popup') as PopupElement
    ref.current = popupElement
    injectPropsToElement(ref.current, props)
    document.body.append(ref.current)
  }, [])

  useEffect(() => {
    if (!ref.current) attachPopupToDom(props)
    injectPropsToElement(ref.current as PopupElement, props)
  }, [attachPopupToDom, props])

  const injectPropsToElement = (element: PopupElement, props: Props) => {
    Object.assign(element, props)
  }

  return null
}

export default Popup
