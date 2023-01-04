import { useEventListener } from '@chakra-ui/react'
import { RefObject } from 'react'

type Handler = (event: MouseEvent) => void

type Props<T> = {
  ref: RefObject<T>
  handler: Handler
  mouseEvent?: 'mousedown' | 'mouseup'
}

export const useOutsideClick = <T extends HTMLElement = HTMLElement>({
  ref,
  handler,
  mouseEvent = 'mousedown',
}: Props<T>): void => {
  const triggerHandlerIfOutside = (event: MouseEvent) => {
    const el = ref?.current
    if (!el || el.contains(event.target as Node)) {
      return
    }
    handler(event)
  }

  useEventListener(mouseEvent, triggerHandlerIfOutside)
}
