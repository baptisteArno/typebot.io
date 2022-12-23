import { LiteBadge } from './LiteBadge'
import { createSignal, onCleanup, onMount, Show } from 'solid-js'
import {
  getViewerUrl,
  injectCustomHeadCode,
  isDefined,
  isNotEmpty,
} from 'utils'
import { getInitialChatReplyQuery } from '@/queries/getInitialChatReplyQuery'
import { ConversationContainer } from './ConversationContainer'
import css from '../assets/index.css'
import { InitialChatReply, StartParams } from 'models'
import { setIsMobile } from '@/utils/isMobileSignal'
import { BotContext } from '@/types'

export type BotProps = StartParams & {
  initialChatReply?: InitialChatReply
  apiHost?: string
}

export const Bot = (props: BotProps) => {
  const [initialChatReply, setInitialChatReply] = createSignal<
    InitialChatReply | undefined
  >(props.initialChatReply)

  onMount(() => {
    if (!props.typebotId) return
    const initialChatReplyValue = initialChatReply()
    if (isDefined(initialChatReplyValue)) {
      const customHeadCode =
        initialChatReplyValue.typebot.settings.metadata.customHeadCode
      if (customHeadCode) injectCustomHeadCode(customHeadCode)
    } else {
      const urlParams = new URLSearchParams(location.search)
      const prefilledVariables: { [key: string]: string } = {}
      urlParams.forEach((value, key) => {
        prefilledVariables[key] = value
      })
      getInitialChatReplyQuery({
        typebotId: props.typebotId,
        apiHost: props.apiHost,
        isPreview: props.isPreview ?? false,
        resultId: props.resultId,
        prefilledVariables: {
          ...prefilledVariables,
          ...props.prefilledVariables,
        },
      }).then((initialChatReply) => {
        setInitialChatReply(initialChatReply)
      })
    }
  })

  return (
    <Show
      when={isNotEmpty(props.apiHost ?? getViewerUrl())}
      fallback={() => (
        <p>process.env.NEXT_PUBLIC_VIEWER_URL is missing in env</p>
      )}
    >
      <Show when={initialChatReply()} keyed>
        {(initialChatReply) => (
          <BotContent
            initialChatReply={initialChatReply}
            context={{
              apiHost: props.apiHost,
              isPreview: props.isPreview ?? false,
              typebotId: props.typebotId as string,
              resultId: initialChatReply.resultId,
            }}
          />
        )}
      </Show>
    </Show>
  )
}

type BotContentProps = {
  initialChatReply: InitialChatReply
  context: BotContext
}

const BotContent = (props: BotContentProps) => {
  let botContainer: HTMLDivElement | undefined

  const resizeObserver = new ResizeObserver((entries) => {
    return setIsMobile(entries[0].target.clientWidth < 400)
  })

  const injectCustomFont = () => {
    const font = document.createElement('link')
    font.href = `https://fonts.googleapis.com/css2?family=${
      props.initialChatReply.typebot?.theme?.general?.font ?? 'Open Sans'
    }:wght@300;400;600&display=swap')`
    font.rel = 'stylesheet'
    document.head.appendChild(font)
  }

  onMount(() => {
    injectCustomFont()
    if (botContainer) {
      resizeObserver.observe(botContainer)
    }
  })

  onCleanup(() => {
    if (botContainer) {
      resizeObserver.unobserve(botContainer)
    }
  })

  return (
    <>
      <style>{css}</style>
      <div
        ref={botContainer}
        class="flex w-full h-full text-base overflow-hidden bg-cover flex-col items-center typebot-container"
      >
        <div class="flex w-full h-full justify-center">
          <ConversationContainer
            context={props.context}
            initialChatReply={props.initialChatReply}
          />
        </div>
        <Show
          when={
            props.initialChatReply.typebot.settings.general.isBrandingEnabled
          }
        >
          <LiteBadge botContainer={botContainer} />
        </Show>
      </div>
    </>
  )
}
