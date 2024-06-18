import { LiteBadge } from './LiteBadge'
import { createEffect, createSignal, onCleanup, onMount, Show } from 'solid-js'
import { isDefined, isNotDefined, isNotEmpty } from '@sniper.io/lib'
import { startChatQuery } from '@/queries/startChatQuery'
import { ConversationContainer } from './ConversationContainer'
import { setIsMobile } from '@/utils/isMobileSignal'
import { BotContext, InitialChatReply, OutgoingLog } from '@/types'
import { ErrorMessage } from './ErrorMessage'
import {
  getExistingResultIdFromStorage,
  getInitialChatReplyFromStorage,
  setInitialChatReplyInStorage,
  setResultInStorage,
  wipeExistingChatStateInStorage,
} from '@/utils/storage'
import { setCssVariablesValue } from '@/utils/setCssVariablesValue'
import immutableCss from '../assets/immutable.css'
import { Font, InputBlock, StartFrom } from '@sniper.io/schemas'
import { clsx } from 'clsx'
import { HTTPError } from 'ky'
import { injectFont } from '@/utils/injectFont'
import { ProgressBar } from './ProgressBar'
import { Portal } from 'solid-js/web'
import { defaultSettings } from '@sniper.io/schemas/features/sniper/settings/constants'
import { persist } from '@/utils/persist'
import { setBotContainerHeight } from '@/utils/botContainerHeightSignal'
import {
  defaultFontFamily,
  defaultFontType,
  defaultProgressBarPosition,
} from '@sniper.io/schemas/features/sniper/theme/constants'

export type BotProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sniper: string | any
  isPreview?: boolean
  resultId?: string
  prefilledVariables?: Record<string, unknown>
  apiHost?: string
  font?: Font
  progressBarRef?: HTMLDivElement
  startFrom?: StartFrom
  sessionId?: string
  onNewInputBlock?: (inputBlock: InputBlock) => void
  onAnswer?: (answer: { message: string; blockId: string }) => void
  onInit?: () => void
  onEnd?: () => void
  onNewLogs?: (logs: OutgoingLog[]) => void
  onChatStatePersisted?: (isEnabled: boolean) => void
}

export const Bot = (props: BotProps & { class?: string }) => {
  const [initialChatReply, setInitialChatReply] = createSignal<
    InitialChatReply | undefined
  >()
  const [customCss, setCustomCss] = createSignal('')
  const [isInitialized, setIsInitialized] = createSignal(false)
  const [error, setError] = createSignal<Error | undefined>()

  const initializeBot = async () => {
    if (props.font) injectFont(props.font)
    setIsInitialized(true)
    const urlParams = new URLSearchParams(location.search)
    props.onInit?.()
    const prefilledVariables: { [key: string]: string } = {}
    urlParams.forEach((value, key) => {
      prefilledVariables[key] = value
    })
    const sniperIdFromProps =
      typeof props.sniper === 'string' ? props.sniper : undefined
    const isPreview =
      typeof props.sniper !== 'string' || (props.isPreview ?? false)
    const resultIdInStorage = getExistingResultIdFromStorage(sniperIdFromProps)
    const { data, error } = await startChatQuery({
      stripeRedirectStatus: urlParams.get('redirect_status') ?? undefined,
      sniper: props.sniper,
      apiHost: props.apiHost,
      isPreview,
      resultId: isNotEmpty(props.resultId) ? props.resultId : resultIdInStorage,
      prefilledVariables: {
        ...prefilledVariables,
        ...props.prefilledVariables,
      },
      startFrom: props.startFrom,
      sessionId: props.sessionId,
    })
    if (error instanceof HTTPError) {
      if (isPreview) {
        return setError(
          new Error(`An error occurred while loading the bot.`, {
            cause: {
              status: error.response.status,
              body: await error.response.json(),
            },
          })
        )
      }
      if (error.response.status === 400 || error.response.status === 403)
        return setError(new Error('This bot is now closed.'))
      if (error.response.status === 404)
        return setError(new Error("The bot you're looking for doesn't exist."))
      return setError(
        new Error(
          `Error! Couldn't initiate the chat. (${error.response.statusText})`
        )
      )
    }

    if (!data) {
      if (error) {
        console.error(error)
        if (isPreview) {
          return setError(
            new Error(`Error! Could not reach server. Check your connection.`, {
              cause: error,
            })
          )
        }
      }
      return setError(
        new Error('Error! Could not reach server. Check your connection.')
      )
    }

    if (
      data.resultId &&
      sniperIdFromProps &&
      (data.sniper.settings.general?.rememberUser?.isEnabled ??
        defaultSettings.general.rememberUser.isEnabled)
    ) {
      if (resultIdInStorage && resultIdInStorage !== data.resultId)
        wipeExistingChatStateInStorage(data.sniper.id)
      const storage =
        data.sniper.settings.general?.rememberUser?.storage ??
        defaultSettings.general.rememberUser.storage
      setResultInStorage(storage)(sniperIdFromProps, data.resultId)
      const initialChatInStorage = getInitialChatReplyFromStorage(
        data.sniper.id
      )
      if (initialChatInStorage) {
        setInitialChatReply(initialChatInStorage)
      } else {
        setInitialChatReply(data)
        setInitialChatReplyInStorage(data, {
          sniperId: data.sniper.id,
          storage,
        })
      }
      props.onChatStatePersisted?.(true)
    } else {
      wipeExistingChatStateInStorage(data.sniper.id)
      setInitialChatReply(data)
      if (data.input?.id && props.onNewInputBlock)
        props.onNewInputBlock(data.input)
      if (data.logs) props.onNewLogs?.(data.logs)
      props.onChatStatePersisted?.(false)
    }

    setCustomCss(data.sniper.theme.customCss ?? '')
  }

  createEffect(() => {
    if (isNotDefined(props.sniper) || isInitialized()) return
    initializeBot().then()
  })

  createEffect(() => {
    if (isNotDefined(props.sniper) || typeof props.sniper === 'string') return
    setCustomCss(props.sniper.theme.customCss ?? '')
    if (
      props.sniper.theme.general?.progressBar?.isEnabled &&
      initialChatReply() &&
      !initialChatReply()?.sniper.theme.general?.progressBar?.isEnabled
    ) {
      setIsInitialized(false)
      initializeBot().then()
    }
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
              sniper: {
                ...initialChatReply.sniper,
                settings:
                  typeof props.sniper === 'string'
                    ? initialChatReply.sniper?.settings
                    : props.sniper?.settings,
                theme:
                  typeof props.sniper === 'string'
                    ? initialChatReply.sniper?.theme
                    : props.sniper?.theme,
              },
            }}
            context={{
              apiHost: props.apiHost,
              isPreview:
                typeof props.sniper !== 'string' || (props.isPreview ?? false),
              resultId: initialChatReply.resultId,
              sessionId: initialChatReply.sessionId,
              sniper: initialChatReply.sniper,
              storage:
                initialChatReply.sniper.settings.general?.rememberUser
                  ?.isEnabled &&
                !(
                  typeof props.sniper !== 'string' ||
                  (props.isPreview ?? false)
                )
                  ? initialChatReply.sniper.settings.general?.rememberUser
                      ?.storage ?? defaultSettings.general.rememberUser.storage
                  : undefined,
            }}
            progressBarRef={props.progressBarRef}
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
  progressBarRef?: HTMLDivElement
  onNewInputBlock?: (inputBlock: InputBlock) => void
  onAnswer?: (answer: { message: string; blockId: string }) => void
  onEnd?: () => void
  onNewLogs?: (logs: OutgoingLog[]) => void
}

const BotContent = (props: BotContentProps) => {
  const [progressValue, setProgressValue] = persist(
    createSignal<number | undefined>(props.initialChatReply.progress),
    {
      storage: props.context.storage,
      key: `sniper-${props.context.sniper.id}-progressValue`,
    }
  )
  let botContainer: HTMLDivElement | undefined

  const resizeObserver = new ResizeObserver((entries) => {
    return setIsMobile(entries[0].target.clientWidth < 400)
  })

  onMount(() => {
    if (!botContainer) return
    resizeObserver.observe(botContainer)
    setBotContainerHeight(`${botContainer.clientHeight}px`)
  })

  createEffect(() => {
    injectFont(
      props.initialChatReply.sniper.theme.general?.font ?? {
        type: defaultFontType,
        family: defaultFontFamily,
      }
    )
    if (!botContainer) return
    setCssVariablesValue(
      props.initialChatReply.sniper.theme,
      botContainer,
      props.context.isPreview
    )
  })

  onCleanup(() => {
    if (!botContainer) return
    resizeObserver.unobserve(botContainer)
  })

  return (
    <div
      ref={botContainer}
      class={clsx(
        'relative flex w-full h-full text-base overflow-hidden flex-col justify-center items-center sniper-container',
        props.class
      )}
    >
      <Show
        when={
          isDefined(progressValue()) &&
          props.initialChatReply.sniper.theme.general?.progressBar?.isEnabled
        }
      >
        <Show
          when={
            props.progressBarRef &&
            (props.initialChatReply.sniper.theme.general?.progressBar
              ?.position ?? defaultProgressBarPosition) === 'fixed'
          }
          fallback={<ProgressBar value={progressValue() as number} />}
        >
          <Portal mount={props.progressBarRef}>
            <ProgressBar value={progressValue() as number} />
          </Portal>
        </Show>
      </Show>
      <ConversationContainer
        context={props.context}
        initialChatReply={props.initialChatReply}
        onNewInputBlock={props.onNewInputBlock}
        onAnswer={props.onAnswer}
        onEnd={props.onEnd}
        onNewLogs={props.onNewLogs}
        onProgressUpdate={setProgressValue}
      />
      <Show
        when={props.initialChatReply.sniper.settings.general?.isBrandingEnabled}
      >
        <LiteBadge botContainer={botContainer} />
      </Show>
    </div>
  )
}
