import styles from '../../../assets/index.css'
import {
  createSignal,
  onMount,
  Show,
  splitProps,
  onCleanup,
  createEffect,
} from 'solid-js'
import { CommandData } from '../../commands'
import { isDefined, isNotDefined } from '@typebot.io/lib'
import { PopupParams } from '../types'
import { Bot, BotProps } from '../../../components/Bot'
import { getPaymentInProgressInStorage } from '@/features/blocks/inputs/payment/helpers/paymentInProgressStorage'
import {
  getBotOpenedStateFromStorage,
  removeBotOpenedStateInStorage,
  setBotOpenedStateInStorage,
} from '@/utils/storage'
import { EnvironmentProvider } from '@ark-ui/solid'

export type PopupProps = BotProps &
  PopupParams & {
    defaultOpen?: boolean
    isOpen?: boolean
    onOpen?: () => void
    onClose?: () => void
  }

export const Popup = (props: PopupProps) => {
  const [popupProps, botProps] = splitProps(props, [
    'onOpen',
    'onClose',
    'autoShowDelay',
    'theme',
    'isOpen',
    'defaultOpen',
  ])

  const [prefilledVariables, setPrefilledVariables] = createSignal(
    botProps.prefilledVariables
  )

  const [isBotOpened, setIsBotOpened] = createSignal(popupProps.isOpen ?? false)

  onMount(() => {
    if (
      popupProps.defaultOpen ||
      getPaymentInProgressInStorage() ||
      getBotOpenedStateFromStorage()
    )
      openBot()
    window.addEventListener('message', processIncomingEvent)
    const autoShowDelay = popupProps.autoShowDelay
    if (isDefined(autoShowDelay)) {
      setTimeout(() => {
        openBot()
      }, autoShowDelay)
    }
  })

  onCleanup(() => {
    window.removeEventListener('message', processIncomingEvent)
  })

  createEffect(() => {
    if (isNotDefined(props.isOpen) || props.isOpen === isBotOpened()) return
    toggleBot()
  })

  createEffect(() => {
    if (!props.prefilledVariables) return
    setPrefilledVariables((existingPrefilledVariables) => ({
      ...existingPrefilledVariables,
      ...props.prefilledVariables,
    }))
  })

  const stopPropagation = (event: MouseEvent) => {
    event.stopPropagation()
  }

  const processIncomingEvent = (event: MessageEvent<CommandData>) => {
    const { data } = event
    if (!data.isFromTypebot) return
    if (data.command === 'open') openBot()
    if (data.command === 'close') closeBot()
    if (data.command === 'toggle') toggleBot()
    if (data.command === 'setPrefilledVariables')
      setPrefilledVariables((existingPrefilledVariables) => ({
        ...existingPrefilledVariables,
        ...data.variables,
      }))
  }

  const openBot = () => {
    setIsBotOpened(true)
    popupProps.onOpen?.()
    document.body.style.setProperty('overflow', 'hidden', 'important')
    document.addEventListener('pointerdown', closeBot)
  }

  const closeBot = () => {
    setIsBotOpened(false)
    popupProps.onClose?.()
    document.body.style.overflow = 'auto'
    document.removeEventListener('pointerdown', closeBot)
    removeBotOpenedStateInStorage()
  }

  const toggleBot = () => {
    isBotOpened() ? closeBot() : openBot()
  }

  const handleOnChatStatePersisted = (isPersisted: boolean) => {
    botProps.onChatStatePersisted?.(isPersisted)
    if (isPersisted) setBotOpenedStateInStorage()
  }

  return (
    <Show when={isBotOpened()}>
      <EnvironmentProvider
        value={document.querySelector('typebot-popup')?.shadowRoot as Node}
      >
        <style>{styles}</style>
        <div
          class="relative"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
          style={{
            'z-index': props.theme?.zIndex ?? 42424242,
          }}
        >
          <style>{styles}</style>
          <div
            class="fixed inset-0 bg-black bg-opacity-50 transition-opacity animate-fade-in"
            part="overlay"
          />
          <div class="fixed inset-0 z-10 overflow-y-auto">
            <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
              <div
                class={
                  'relative h-[80vh] transform overflow-hidden rounded-lg text-left transition-all sm:my-8 w-full max-w-lg' +
                  (props.theme?.backgroundColor ? ' shadow-xl' : '')
                }
                style={{
                  'background-color':
                    props.theme?.backgroundColor ?? 'transparent',
                  'max-width': props.theme?.width ?? '512px',
                }}
                on:pointerdown={stopPropagation}
              >
                <Bot
                  {...botProps}
                  prefilledVariables={prefilledVariables()}
                  onChatStatePersisted={handleOnChatStatePersisted}
                />
              </div>
            </div>
          </div>
        </div>
      </EnvironmentProvider>
    </Show>
  )
}
