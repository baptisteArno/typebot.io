import { LiteBadge } from './LiteBadge'
import { createEffect, createSignal, onCleanup, onMount, Show } from 'solid-js'
import { injectCustomHeadCode, isNotEmpty } from '@typebot.io/lib'
import { getInitialChatReplyQuery } from '@/queries/getInitialChatReplyQuery'
import { ConversationContainer } from './ConversationContainer'
import { setIsMobile } from '@/utils/isMobileSignal'
import { BotContext, InitialChatReply, OutgoingLog } from '@/types'
import { ErrorMessage } from './ErrorMessage'
import {
  getExistingResultIdFromSession,
  setResultInSession,
} from '@/utils/sessionStorage'
import { setCssVariablesValue } from '@/utils/setCssVariablesValue'
import immutableCss from '../assets/immutable.css'

export type BotProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typebot: string | any
  isPreview?: boolean
  resultId?: string
  startGroupId?: string
  prefilledVariables?: Record<string, unknown>
  apiHost?: string
  onNewInputBlock?: (ids: { id: string; groupId: string }) => void
  onAnswer?: (answer: { message: string; blockId: string }) => void
  onInit?: () => void
  onEnd?: () => void
  onNewLogs?: (logs: OutgoingLog[]) => void
}

export const Bot = (props: BotProps & { class?: string }) => {
  const [initialChatReply, setInitialChatReply] = createSignal<
    InitialChatReply | undefined
  >()
  const [customCss, setCustomCss] = createSignal('')
  const [isInitialized, setIsInitialized] = createSignal(false)
  const [error, setError] = createSignal<Error | undefined>()

  const initializeBot = async () => {
    setIsInitialized(true)
    const urlParams = new URLSearchParams(location.search)
    props.onInit?.()
    const prefilledVariables: { [key: string]: string } = {}
    urlParams.forEach((value, key) => {
      prefilledVariables[key] = value
    })
    const typebotIdFromProps =
      typeof props.typebot === 'string' ? props.typebot : undefined
    const { data, error } = await getInitialChatReplyQuery({
      typebot: props.typebot,
      apiHost: props.apiHost,
      isPreview: props.isPreview ?? false,
      resultId: isNotEmpty(props.resultId)
        ? props.resultId
        : getExistingResultIdFromSession(typebotIdFromProps),
      startGroupId: props.startGroupId,
      prefilledVariables: {
        ...prefilledVariables,
        ...props.prefilledVariables,
      },
    })
    if (error && 'code' in error && typeof error.code === 'string') {
      if (typeof props.typebot !== 'string' || (props.isPreview ?? false)) {
        return setError(
          new Error('An error occurred while loading the bot.', {
            cause: error.message,
          })
        )
      }
      if (['BAD_REQUEST', 'FORBIDDEN'].includes(error.code))
        return setError(new Error('This bot is now closed.'))
      if (error.code === 'NOT_FOUND')
        return setError(new Error("The bot you're looking for doesn't exist."))
    }

    if (!data) return setError(new Error("Error! Couldn't initiate the chat."))

    if (data.resultId && typebotIdFromProps)
      setResultInSession(typebotIdFromProps, data.resultId)
    setInitialChatReply(data)
    setCustomCss(data.typebot.theme.customCss ?? '')

    if (data.input?.id && props.onNewInputBlock)
      props.onNewInputBlock({
        id: data.input.id,
        groupId: data.input.groupId,
      })
    if (data.logs) props.onNewLogs?.(data.logs)
    const customHeadCode = data.typebot.settings.metadata.customHeadCode
    if (customHeadCode) injectCustomHeadCode(customHeadCode)
  }

  createEffect(() => {
    if (!props.typebot || isInitialized()) return
    initializeBot().then()
  })

  createEffect(() => {
    if (typeof props.typebot === 'string') return
    setCustomCss(props.typebot.theme.customCss ?? '')
  })

  onCleanup(() => {
    setIsInitialized(false)
  })

  return (
    <>
      <style>{customCss()}</style>
      <style>{immutableCss}</style>
      <Show when={error()} keyed>
        {(error) => <ErrorMessage error={error} />}
      </Show>
      <Show when={initialChatReply()} keyed>
        {(initialChatReply) => (
          <BotContent
            class={props.class}
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
              isPreview:
                typeof props.typebot !== 'string' || (props.isPreview ?? false),
              typebotId: initialChatReply.typebot.id,
              resultId: initialChatReply.resultId,
            }}
            onNewInputBlock={props.onNewInputBlock}
            onNewLogs={props.onNewLogs}
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
  class?: string
  onNewInputBlock?: (block: { id: string; groupId: string }) => void
  onAnswer?: (answer: { message: string; blockId: string }) => void
  onEnd?: () => void
  onNewLogs?: (logs: OutgoingLog[]) => void
}

const BotContent = (props: BotContentProps) => {
  let botContainer: HTMLDivElement | undefined

  const resizeObserver = new ResizeObserver((entries) => {
    return setIsMobile(entries[0].target.clientWidth < 400)
  })

  const injectCustomFont = () => {
    const existingFont = document.getElementById('bot-font')
    if (
      existingFont
        ?.getAttribute('href')
        ?.includes(
          props.initialChatReply.typebot?.theme?.general?.font ?? 'Open Sans'
        )
    )
      return
    const font = document.createElement('link')
    font.href = `https://fonts.googleapis.com/css2?family=${
      props.initialChatReply.typebot?.theme?.general?.font ?? 'Open Sans'
    }:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&display=swap');')`
    font.rel = 'stylesheet'
    font.id = 'bot-font'
    document.head.appendChild(font)
  }

  onMount(() => {
    if (!botContainer) return
    resizeObserver.observe(botContainer)
  })

  createEffect(() => {
    injectCustomFont()
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
      class={
        'relative flex w-full h-full text-base overflow-hidden bg-cover bg-center flex-col items-center typebot-container ' +
        props.class
      }
    >
      <div class="flex w-full h-full justify-center">
        <ConversationContainer
          context={props.context}
          initialChatReply={props.initialChatReply}
          onNewInputBlock={props.onNewInputBlock}
          onAnswer={props.onAnswer}
          onEnd={props.onEnd}
          onNewLogs={props.onNewLogs}
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
