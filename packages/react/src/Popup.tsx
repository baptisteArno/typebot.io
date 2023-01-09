import { useEffect } from 'react'
import type { PopupProps } from '@typebot.io/js'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'typebot-popup': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >
    }
  }
}

export const Popup = (props: PopupProps) => {
  useEffect(() => {
    ;(async () => {
      const { registerPopupComponent } = await import('@typebot.io/js')
      registerPopupComponent(props)
    })()
  }, [props])

  return <typebot-popup />
}
