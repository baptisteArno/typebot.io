import styles from '../../../assets/index.css'
import { createSignal, onMount, Show, splitProps, onCleanup } from 'solid-js'
import { Bot, BotProps } from '../../../components/Bot'
import { CommandData } from '@/features/commands'
import { isDefined } from 'utils'
import { PopupParams } from '../types'

export type PopupProps = BotProps &
  PopupParams & {
    onOpen?: () => void
    onClose?: () => void
  }

export const Popup = (props: PopupProps) => {
  let botContainer: HTMLDivElement | undefined

  const [popupProps, botProps] = splitProps(props, [
    'onOpen',
    'onClose',
    'autoShowDelay',
    'style',
  ])

  const [prefilledVariables, setPrefilledVariables] = createSignal(
    // eslint-disable-next-line solid/reactivity
    botProps.prefilledVariables
  )

  const [isBotOpened, setIsBotOpened] = createSignal(false)

  onMount(() => {
    window.addEventListener('click', processWindowClick)
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
    window.removeEventListener('click', processWindowClick)
  })

  const processWindowClick = (event: MouseEvent) => {
    if (!botContainer || botContainer.contains(event.target as Node)) return
    setIsBotOpened(false)
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
    if (isBotOpened()) popupProps.onOpen?.()
  }

  const closeBot = () => {
    setIsBotOpened(false)
    if (isBotOpened()) popupProps.onClose?.()
  }

  const toggleBot = () => {
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
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity animate-fade-in" />
        <div class="fixed inset-0 z-10 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div
              class="relative h-[80vh] transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
              style={{
                width: popupProps.style?.width ?? '100%',
                'background-color': popupProps.style?.backgroundColor ?? '#fff',
              }}
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
