import { RefObject, useEffect } from 'react'

type Handler = (event: MouseEvent) => void

type Props<T> = {
  ref: RefObject<T>
  handler: Handler
  capture?: boolean
  isEnabled?: boolean
}

export const useOutsideClick = <T extends HTMLElement = HTMLElement>({
  ref,
  handler,
  capture,
  isEnabled,
}: Props<T>): void => {
  useEffect(() => {
    if (isEnabled === false) return
    const triggerHandlerIfOutside = (event: MouseEvent) => {
      const el = ref?.current
      if (!el || el.contains(event.target as Node)) {
        return
      }
      handler(event)
    }

    document.addEventListener('pointerdown', triggerHandlerIfOutside, {
      capture,
    })
    return () => {
      document.removeEventListener('pointerdown', triggerHandlerIfOutside, {
        capture,
      })
    }
  }, [capture, handler, isEnabled, ref])
}
