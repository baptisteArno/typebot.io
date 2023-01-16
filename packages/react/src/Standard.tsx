import { useEffect, useRef } from 'react'
import type { BotProps } from '@typebot.io/js'
import { defaultBotProps } from './constants'

type Props = BotProps & { style?: React.CSSProperties; className?: string }

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'typebot-standard': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { class?: string }
    }
  }
}

export const Standard = ({ style, className, ...props }: Props) => {
  const ref = useRef<(HTMLDivElement & Props) | null>(null)

  useEffect(() => {
    ;(async () => {
      const { registerStandardComponent } = await import('@typebot.io/js')
      registerStandardComponent(defaultBotProps)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!ref.current) return
    ref.current.typebot = props.typebot
    ref.current.prefilledVariables = props.prefilledVariables
    ref.current.onNewInputBlock = props.onNewInputBlock
    ref.current.onAnswer = props.onAnswer
    ref.current.onEnd = props.onEnd
    ref.current.onInit = props.onInit
  }, [
    props.onAnswer,
    props.onNewInputBlock,
    props.prefilledVariables,
    props.typebot,
    props.onEnd,
    props.onInit,
  ])

  return (
    <typebot-standard
      ref={ref}
      api-host={props.apiHost}
      start-group-id={props.startGroupId}
      style={style}
      class={className}
      result-id={props.resultId}
      is-preview={props.isPreview}
    />
  )
}
