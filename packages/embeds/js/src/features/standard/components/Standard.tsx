import styles from '../../../assets/index.css'
import { Bot, BotProps } from '@/components/Bot'
import { CommandData } from '@/features/commands/types'
import { createSignal, onCleanup, onMount, Show } from 'solid-js'
import { EnvironmentProvider } from '@ark-ui/solid'

const hostElementCss = `
:host {
  display: block;
  width: 100%;
  height: 100%;
  overflow-y: hidden;
}
`

export const Standard = (
  props: BotProps,
  { element }: { element: HTMLElement }
) => {
  const [isBotDisplayed, setIsBotDisplayed] = createSignal(false)

  const launchBot = () => {
    setIsBotDisplayed(true)
  }

  const botLauncherObserver = new IntersectionObserver((intersections) => {
    if (intersections.some((intersection) => intersection.isIntersecting))
      launchBot()
  })

  onMount(() => {
    window.addEventListener('message', processIncomingEvent)
    botLauncherObserver.observe(element)
  })

  const processIncomingEvent = (event: MessageEvent<CommandData>) => {
    const { data } = event
    if (!data.isFromTypebot) return
  }

  onCleanup(() => {
    botLauncherObserver.disconnect()
  })

  return (
    <EnvironmentProvider
      value={document.querySelector('typebot-standard')?.shadowRoot as Node}
    >
      <style>
        {styles}
        {hostElementCss}
      </style>
      <Show when={isBotDisplayed()}>
        <Bot {...props} />
      </Show>
    </EnvironmentProvider>
  )
}
