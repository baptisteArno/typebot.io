import { LiteBadge } from './LiteBadge'
import { createEffect, createSignal, onCleanup, onMount, Show } from 'solid-js'
import { getViewerUrl, injectCustomHeadCode, isEmpty, isNotEmpty } from 'utils'
import { getInitialChatReplyQuery } from '@/queries/getInitialChatReplyQuery'
import { ConversationContainer } from './ConversationContainer'
import css from '../assets/index.css'
import { StartParams } from 'models'
import { setIsMobile } from '@/utils/isMobileSignal'
import { BotContext, InitialChatReply } from '@/types'
import { ErrorMessage } from './ErrorMessage'
import {
  getExistingResultIdFromSession,
  setResultInSession,
} from '@/utils/sessionStorage'
import { setCssVariablesValue } from '@/utils/setCssVariablesValue'

export type BotProps = StartParams & {
  apiHost?: string
  onNewInputBlock?: (ids: { id: string; groupId: string }) => void
  onAnswer?: (answer: { message: string; blockId: string }) => void
  onInit?: () => void
  onEnd?: () => void
}

export const Bot = (props: BotProps) => {
  const [initialChatReply, setInitialChatReply] = createSignal<
    InitialChatReply | undefined
  >()
  const [error, setError] = createSignal<Error | undefined>(
    // eslint-disable-next-line solid/reactivity
    isEmpty(isEmpty(props.apiHost) ? getViewerUrl() : props.apiHost)
      ? new Error('process.env.NEXT_PUBLIC_VIEWER_URL is missing in env')
      : undefined
  )

  const initializeBot = async () => {
    const urlParams = new URLSearchParams(location.search)
    props.onInit?.()
    const prefilledVariables: { [key: string]: string } = {}
    urlParams.forEach((value, key) => {
      prefilledVariables[key] = value
    })
    const { data, error } = await getInitialChatReplyQuery({
      typebot: props.typebot,
      apiHost: props.apiHost,
      isPreview: props.isPreview ?? false,
      resultId: isNotEmpty(props.resultId)
        ? props.resultId
        : getExistingResultIdFromSession(),
      startGroupId: props.startGroupId,
      prefilledVariables: {
        ...prefilledVariables,
        ...props.prefilledVariables,
      },
    })
    if (error && 'code' in error && typeof error.code === 'string') {
      if (['BAD_REQUEST', 'FORBIDDEN'].includes(error.code))
        setError(new Error('This bot is now closed.'))
      if (error.code === 'NOT_FOUND') setError(new Error('Typebot not found.'))
      return
    }

    if (!data) return setError(new Error("Couldn't initiate the chat"))

    if (data.resultId) setResultInSession(data.resultId)
    setInitialChatReply(data)

    if (data.input?.id && props.onNewInputBlock)
      props.onNewInputBlock({
        id: data.input.id,
        groupId: data.input.groupId,
      })
    const customHeadCode = data.typebot.settings.metadata.customHeadCode
    if (customHeadCode) injectCustomHeadCode(customHeadCode)
  }

  onMount(() => {
    initializeBot().then()
  })

  return (
    <>
      <style>{css}</style>
      <Show when={error()} keyed>
        {(error) => <ErrorMessage error={error} />}
      </Show>
      <Show when={initialChatReply()} keyed>
        {(initialChatReply) => (
          <BotContent
            initialChatReply={{
              ...initialChatReply,
              typebot: {
                ...initialChatReply.typebot,
                settings:
                  typeof props.typebot === 'string'
                    ? initialChatReply.typebot?.settings
                    : props.typebot?.settings,
                theme:
                  typeof props.typebot === 'string'
                    ? initialChatReply.typebot?.theme
                    : props.typebot?.theme,
              },
            }}
            context={{
              apiHost: props.apiHost,
              isPreview: props.isPreview ?? false,
              typebotId: initialChatReply.typebot.id,
              resultId: initialChatReply.resultId,
            }}
            onNewInputBlock={props.onNewInputBlock}
            onAnswer={props.onAnswer}
            onEnd={props.onEnd}
          />
        )}
      </Show>
    </>
  )
}

type BotContentProps = {
  initialChatReply: InitialChatReply
  context: BotContext
  onNewInputBlock?: (ids: { id: string; groupId: string }) => void
  onAnswer?: (answer: { message: string; blockId: string }) => void
  onEnd?: () => void
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
    if (!botContainer) return
    resizeObserver.observe(botContainer)
  })

  createEffect(() => {
    if (!botContainer) return
    setCssVariablesValue(props.initialChatReply.typebot.theme, botContainer)
  })

  onCleanup(() => {
    if (!botContainer) return
    resizeObserver.unobserve(botContainer)
  })

  return (
    <div
      ref={botContainer}
      class="relative flex w-full h-full text-base overflow-hidden bg-cover flex-col items-center typebot-container"
    >
      <div class="flex w-full h-full justify-center">
        <ConversationContainer
          context={props.context}
          initialChatReply={props.initialChatReply}
          onNewInputBlock={props.onNewInputBlock}
          onAnswer={props.onAnswer}
          onEnd={props.onEnd}
        />
      </div>
      <Show
        when={props.initialChatReply.typebot.settings.general.isBrandingEnabled}
      >
        <LiteBadge botContainer={botContainer} />
      </Show>
    </div>
  )
}
