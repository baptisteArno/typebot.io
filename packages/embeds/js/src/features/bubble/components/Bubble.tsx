import {
  createSignal,
  onMount,
  Show,
  splitProps,
  onCleanup,
  createEffect,
} from 'solid-js'
import styles from '../../../assets/index.css'
import { CommandData } from '../../commands'
import { BubbleButton } from './BubbleButton'
import { PreviewMessage, PreviewMessageProps } from './PreviewMessage'
import { isDefined } from '@typebot.io/lib'
import { BubbleParams } from '../types'
import { Bot, BotProps } from '../../../components/Bot'

export type BubbleProps = BotProps &
  BubbleParams & {
    onOpen?: () => void
    onClose?: () => void
    onPreviewMessageClick?: () => void
  }

export const Bubble = (props: BubbleProps) => {
  const [bubbleProps, botProps] = splitProps(props, [
    'onOpen',
    'onClose',
    'previewMessage',
    'onPreviewMessageClick',
    'theme',
  ])
  const [prefilledVariables, setPrefilledVariables] = createSignal(
    // eslint-disable-next-line solid/reactivity
    botProps.prefilledVariables
  )
  const [isPreviewMessageDisplayed, setIsPreviewMessageDisplayed] =
    createSignal(false)
  const [previewMessage, setPreviewMessage] = createSignal<
    Pick<PreviewMessageProps, 'avatarUrl' | 'message'>
  >({
    message: bubbleProps.previewMessage?.message ?? '',
    avatarUrl: bubbleProps.previewMessage?.avatarUrl,
  })

  const [isBotOpened, setIsBotOpened] = createSignal(false)
  const [isBotStarted, setIsBotStarted] = createSignal(false)

  onMount(() => {
    window.addEventListener('message', processIncomingEvent)
    const autoShowDelay = bubbleProps.previewMessage?.autoShowDelay
    if (isDefined(autoShowDelay)) {
      setTimeout(() => {
        showMessage()
      }, autoShowDelay)
    }
  })

  onCleanup(() => {
    window.removeEventListener('message', processIncomingEvent)
  })

  createEffect(() => {
    if (!props.prefilledVariables) return
    setPrefilledVariables((existingPrefilledVariables) => ({
      ...existingPrefilledVariables,
      ...props.prefilledVariables,
    }))
  })

  const processIncomingEvent = (event: MessageEvent<CommandData>) => {
    const { data } = event
    if (!data.isFromTypebot) return
    if (data.command === 'open') openBot()
    if (data.command === 'close') closeBot()
    if (data.command === 'toggle') toggleBot()
    if (data.command === 'showPreviewMessage') showMessage(data.message)
    if (data.command === 'hidePreviewMessage') hideMessage()
    if (data.command === 'setPrefilledVariables')
      setPrefilledVariables((existingPrefilledVariables) => ({
        ...existingPrefilledVariables,
        ...data.variables,
      }))
  }

  const openBot = () => {
    if (!isBotStarted()) setIsBotStarted(true)
    hideMessage()
    setIsBotOpened(true)
    if (isBotOpened()) bubbleProps.onOpen?.()
  }

  const closeBot = () => {
    setIsBotOpened(false)
    if (isBotOpened()) bubbleProps.onClose?.()
  }

  const toggleBot = () => {
    isBotOpened() ? closeBot() : openBot()
  }

  const handlePreviewMessageClick = () => {
    bubbleProps.onPreviewMessageClick?.()
    openBot()
  }

  const showMessage = (
    previewMessage?: Pick<PreviewMessageProps, 'avatarUrl' | 'message'>
  ) => {
    if (previewMessage) setPreviewMessage(previewMessage)
    if (isBotOpened()) return
    setIsPreviewMessageDisplayed(true)
  }

  const hideMessage = () => {
    setIsPreviewMessageDisplayed(false)
  }

  return (
    <>
      <style>{styles}</style>
      <Show when={isPreviewMessageDisplayed()}>
        <PreviewMessage
          {...previewMessage()}
          previewMessageTheme={bubbleProps.theme?.previewMessage}
          buttonSize={bubbleProps.theme?.button?.size}
          onClick={handlePreviewMessageClick}
          onCloseClick={hideMessage}
        />
      </Show>
      <BubbleButton
        {...bubbleProps.theme?.button}
        toggleBot={toggleBot}
        isBotOpened={isBotOpened()}
      />
      <div
        part="bot"
        style={{
          height: 'calc(100% - 80px)',
          transition:
            'transform 200ms cubic-bezier(0, 1.2, 1, 1), opacity 150ms ease-out',
          'transform-origin': 'bottom right',
          transform: isBotOpened() ? 'scale3d(1, 1, 1)' : 'scale3d(0, 0, 1)',
          'box-shadow': 'rgb(0 0 0 / 16%) 0px 5px 40px',
          'background-color': bubbleProps.theme?.chatWindow?.backgroundColor,
          'z-index': 42424242,
        }}
        class={
          'fixed sm:right-5 rounded-lg w-full sm:w-[400px] max-h-[704px]' +
          (isBotOpened() ? ' opacity-1' : ' opacity-0 pointer-events-none') +
          (props.theme?.button?.size === 'large' ? ' bottom-24' : ' bottom-20')
        }
      >
        <Show when={isBotStarted()}>
          <Bot
            {...botProps}
            prefilledVariables={prefilledVariables()}
            class="rounded-lg"
          />
        </Show>
      </div>
    </>
  )
}
