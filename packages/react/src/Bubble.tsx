import { useEffect, useRef } from 'react'
import type { BubbleProps } from '@typebot.io/js'
import { defaultBubbleProps } from './constants'

type Props = BubbleProps & { style?: React.CSSProperties; className?: string }

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

export const Bubble = ({ style, className, ...props }: Props) => {
  const ref = useRef<(HTMLDivElement & Props) | null>(null)

  useEffect(() => {
    ;(async () => {
      const { registerBubbleComponent } = await import('@typebot.io/js')
      registerBubbleComponent(defaultBubbleProps)
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
    ref.current.onPreviewMessageClick = props.onPreviewMessageClick
    ref.current.onEnd = props.onEnd
    ref.current.onInit = props.onInit
  }, [
    props.onAnswer,
    props.onClose,
    props.onNewInputBlock,
    props.onOpen,
    props.onPreviewMessageClick,
    props.prefilledVariables,
    props.typebot,
    props.onEnd,
    props.onInit,
  ])

  return (
    <typebot-bubble
      ref={ref}
      api-host={props.apiHost}
      start-group-id={props.startGroupId}
      result-id={props.resultId}
      is-preview={props.isPreview}
      class={className}
      style={style}
    />
  )
}
