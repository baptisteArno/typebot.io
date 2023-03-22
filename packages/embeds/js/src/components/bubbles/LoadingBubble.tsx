import { TypingBubble } from '@/components'

export const LoadingBubble = () => (
  <div class="flex flex-col animate-fade-in">
    <div class="flex mb-2 w-full items-center">
      <div class={'flex relative items-start typebot-host-bubble'}>
        <div
          class="flex items-center absolute px-4 py-2 bubble-typing "
          style={{
            width: '64px',
            height: '32px',
          }}
          data-testid="host-bubble"
        >
          <TypingBubble />
        </div>
        <p
          class={
            'overflow-hidden text-fade-in mx-4 my-2 whitespace-pre-wrap slate-html-container relative opacity-0 h-6 text-ellipsis'
          }
        />
      </div>
    </div>
  </div>
)
