import { useEffect, useRef } from 'react'
import type { PopupProps } from '@typebot.io/js'
import { defaultPopupProps } from './constants'

type Props = PopupProps & { style?: React.CSSProperties; className?: string }

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

export const Popup = ({ style, className, ...props }: Props) => {
  const ref = useRef<(HTMLDivElement & Props) | null>(null)

  useEffect(() => {
    ;(async () => {
      const { registerPopupComponent } = await import('@typebot.io/js')
      registerPopupComponent(defaultPopupProps)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!ref.current) return
    ref.current.typebot = props.typebot
    ref.current.prefilledVariables = props.prefilledVariables
    ref.current.onClose = props.onClose
    ref.current.onOpen = props.onOpen
    ref.current.onNewInputBlock = props.onNewInputBlock
    ref.current.onAnswer = props.onAnswer
    ref.current.onEnd = props.onEnd
    ref.current.onInit = props.onInit
  }, [
    props.onAnswer,
    props.onClose,
    props.onEnd,
    props.onNewInputBlock,
    props.onOpen,
    props.onInit,
    props.prefilledVariables,
    props.typebot,
  ])

  return (
    <typebot-popup
      ref={ref}
      api-host={props.apiHost}
      start-group-id={props.startGroupId}
      result-id={props.resultId}
      is-preview={props.isPreview}
      is-open={props.isOpen}
      default-open={props.defaultOpen}
      class={className}
      style={style}
    />
  )
}
