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
import { getPaymentInProgressInStorage } from '@/features/blocks/inputs/payment/helpers/paymentInProgressStorage'
import {
  getBotOpenedStateFromStorage,
  removeBotOpenedStateInStorage,
  setBotOpenedStateInStorage,
} from '@/utils/storage'
import { EnvironmentProvider } from '@ark-ui/solid'

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
    'autoShowDelay',
  ])
  const [isMounted, setIsMounted] = createSignal(true)
  const [prefilledVariables, setPrefilledVariables] = createSignal(
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
  const [buttonSize, setButtonSize] = createSignal(
    parseButtonSize(bubbleProps.theme?.button?.size ?? 'medium')
  )
  createEffect(() => {
    setButtonSize(parseButtonSize(bubbleProps.theme?.button?.size ?? 'medium'))
  })

  let progressBarContainerRef

  onMount(() => {
    window.addEventListener('message', processIncomingEvent)
    const autoShowDelay = bubbleProps.autoShowDelay
    const previewMessageAutoShowDelay =
      bubbleProps.previewMessage?.autoShowDelay
    if (getBotOpenedStateFromStorage() || getPaymentInProgressInStorage())
      openBot()
    if (isDefined(autoShowDelay)) {
      setTimeout(() => {
        openBot()
      }, autoShowDelay)
    }
    if (isDefined(previewMessageAutoShowDelay)) {
      setTimeout(() => {
        showMessage()
      }, previewMessageAutoShowDelay)
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
    if (data.command === 'unmount') unmount()
  }

  const openBot = () => {
    if (!isBotStarted()) setIsBotStarted(true)
    hideMessage()
    setIsBotOpened(true)
    if (isBotOpened()) bubbleProps.onOpen?.()
  }

  const closeBot = () => {
    setIsBotOpened(false)
    removeBotOpenedStateInStorage()
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

  const unmount = () => {
    if (isBotOpened()) {
      closeBot()
      setTimeout(() => {
        setIsMounted(false)
      }, 200)
    } else setIsMounted(false)
  }

  const handleOnChatStatePersisted = (isPersisted: boolean) => {
    botProps.onChatStatePersisted?.(isPersisted)
    if (isPersisted) setBotOpenedStateInStorage()
  }

  return (
    <Show when={isMounted()}>
      <EnvironmentProvider
        value={document.querySelector('typebot-bubble')?.shadowRoot as Node}
      >
        <style>{styles}</style>
        <Show when={isPreviewMessageDisplayed()}>
          <PreviewMessage
            {...previewMessage()}
            placement={bubbleProps.theme?.placement}
            previewMessageTheme={bubbleProps.theme?.previewMessage}
            buttonSize={buttonSize()}
            onClick={handlePreviewMessageClick}
            onCloseClick={hideMessage}
          />
        </Show>
        <BubbleButton
          {...bubbleProps.theme?.button}
          placement={bubbleProps.theme?.placement}
          toggleBot={toggleBot}
          isBotOpened={isBotOpened()}
          buttonSize={buttonSize()}
        />
        <div ref={progressBarContainerRef} />
        <div
          part="bot"
          style={{
            height: `calc(100% - ${buttonSize()} - 32px)`,
            'max-height': props.theme?.chatWindow?.maxHeight ?? '704px',
            'max-width': props.theme?.chatWindow?.maxWidth ?? '400px',
            transition:
              'transform 200ms cubic-bezier(0, 1.2, 1, 1), opacity 150ms ease-out',
            'transform-origin':
              props.theme?.placement === 'left'
                ? 'bottom left'
                : 'bottom right',
            transform: isBotOpened() ? 'scale3d(1, 1, 1)' : 'scale3d(0, 0, 1)',
            'box-shadow': 'rgb(0 0 0 / 16%) 0px 5px 40px',
            'background-color': bubbleProps.theme?.chatWindow?.backgroundColor,
            'z-index': 42424242,
            bottom: `calc(${buttonSize()} + 32px)`,
          }}
          class={
            'fixed rounded-lg w-full' +
            (isBotOpened() ? ' opacity-1' : ' opacity-0 pointer-events-none') +
            (props.theme?.placement === 'left'
              ? ' left-5'
              : ' sm:right-5 right-0')
          }
        >
          <Show when={isBotStarted()}>
            <Bot
              {...botProps}
              onChatStatePersisted={handleOnChatStatePersisted}
              prefilledVariables={prefilledVariables()}
              class="rounded-lg"
              progressBarRef={progressBarContainerRef}
            />
          </Show>
        </div>
      </EnvironmentProvider>
    </Show>
  )
}

const parseButtonSize = (
  size: NonNullable<NonNullable<BubbleProps['theme']>['button']>['size']
): `${number}px` =>
  size === 'medium' ? '48px' : size === 'large' ? '64px' : size ? size : '48px'
