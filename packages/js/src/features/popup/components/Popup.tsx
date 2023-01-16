import styles from '../../../assets/index.css'
import {
  createSignal,
  onMount,
  Show,
  splitProps,
  onCleanup,
  createEffect,
} from 'solid-js'
import { Bot, BotProps } from '../../../components/Bot'
import { CommandData } from '@/features/commands'
import { isDefined } from 'utils'
import { PopupParams } from '../types'

export type PopupProps = BotProps &
  PopupParams & {
    defaultOpen?: boolean
    isOpen?: boolean
    onOpen?: () => void
    onClose?: () => void
  }

export const Popup = (props: PopupProps) => {
  let botContainer: HTMLDivElement | undefined

  const [popupProps, botProps] = splitProps(props, [
    'onOpen',
    'onClose',
    'autoShowDelay',
    'theme',
    'isOpen',
    'defaultOpen',
  ])

  const [prefilledVariables, setPrefilledVariables] = createSignal(
    // eslint-disable-next-line solid/reactivity
    botProps.prefilledVariables
  )

  const [isBotOpened, setIsBotOpened] = createSignal(
    // eslint-disable-next-line solid/reactivity
    popupProps.isOpen ?? popupProps.defaultOpen ?? false
  )

  onMount(() => {
    document.addEventListener('pointerdown', processWindowClick)
    botContainer?.addEventListener('pointerdown', stopPropagation)
    window.addEventListener('message', processIncomingEvent)
    const autoShowDelay = popupProps.autoShowDelay
    if (isDefined(autoShowDelay)) {
      setTimeout(() => {
        openBot()
      }, autoShowDelay)
    }
  })

  createEffect(() => {
    const isOpen = popupProps.isOpen
    if (isDefined(isOpen)) setIsBotOpened(isOpen)
  })

  onCleanup(() => {
    document.removeEventListener('pointerdown', processWindowClick)
    botContainer?.removeEventListener('pointerdown', stopPropagation)
    window.removeEventListener('message', processIncomingEvent)
  })

  const processWindowClick = () => {
    setIsBotOpened(false)
  }

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
    if (isBotOpened()) popupProps.onOpen?.()
    if (isDefined(props.isOpen)) return
    setIsBotOpened(true)
  }

  const closeBot = () => {
    if (isBotOpened()) popupProps.onClose?.()
    if (isDefined(props.isOpen)) return
    setIsBotOpened(false)
  }

  const toggleBot = () => {
    if (isDefined(props.isOpen)) return
    isBotOpened() ? closeBot() : openBot()
  }

  return (
    <Show when={isBotOpened()}>
      <div
        class="relative z-10"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <style>{styles}</style>
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity animate-fade-in" />
        <div class="fixed inset-0 z-10 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div
              class="relative h-[80vh] transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
              ref={botContainer}
            >
              <Bot {...botProps} prefilledVariables={prefilledVariables()} />
            </div>
          </div>
        </div>
      </div>
    </Show>
  )
}
