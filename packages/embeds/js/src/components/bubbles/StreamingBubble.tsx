import { streamingMessage } from '@/utils/streamingMessageSignal'
import { createEffect, createSignal } from 'solid-js'

type Props = {
  streamingMessageId: string
}

export const StreamingBubble = (props: Props) => {
  let ref: HTMLDivElement | undefined
  const [content, setContent] = createSignal<string>('')

  createEffect(() => {
    if (streamingMessage()?.id === props.streamingMessageId)
      setContent(streamingMessage()?.content ?? '')
  })

  return (
    <div class="flex flex-col animate-fade-in" ref={ref}>
      <div class="flex w-full items-center">
        <div class="flex relative items-start typebot-host-bubble">
          <div
            class="flex items-center absolute px-4 py-2 bubble-typing "
            style={{
              width: '100%',
              height: '100%',
            }}
            data-testid="host-bubble"
          />
          <div
            class={
              'overflow-hidden text-fade-in mx-4 my-2 whitespace-pre-wrap slate-html-container relative text-ellipsis opacity-100 h-full'
            }
          >
            {content()}
          </div>
        </div>
      </div>
    </div>
  )
}
